from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
from datetime import timedelta
import json
import os
import cv2

# Create a directory to store video frames
FRAME_DIR = "frames"
os.makedirs(FRAME_DIR, exist_ok=True)

# Initialize the Flask app with static folder for frames
app = Flask(__name__, static_folder="frames", static_url_path="/frames")

# Enable CORS for the app
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Initialize the Generative AI model
with open('secrets.json', 'r') as file:
    secrets = json.load(file)
api_key = secrets['API-KEY']
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

# Function to fetch English subtitles for a YouTube video
# @param video_url: URL of the YouTube video
# @return: Tuple containing the transcript, formatted subtitles, video title, and video description
def get_english_subtitles(video_url):
    # Options for YouTube downloader
    ydl_opts = {
        'quiet': True,
        'noplaylist': True, 
    }

    # Extract video information using yt_dlp, can extract other info also
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        title = info.get("title")
        description = info.get("description")

    # Extract video ID from the URL
    video_id = video_url.split("v=")[-1]
    print(f"Fetching transcript for video ID: {video_id}")

    # Fetch English subtitles using YouTubeTranscriptApi
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        formatted_subtitles = ' '.join(entry['text'] for entry in transcript)
        return transcript, formatted_subtitles, title, description
    except Exception as subtitle_error:
        print(f"Could not fetch subtitles: {subtitle_error}")
        return None, None, None, None

# Function to format time in seconds to HH:MM:SS format
# @param seconds: Time in seconds
# Example: format_time(65) -> "00:01:05"
def format_time(seconds):
    return str(timedelta(seconds=seconds))[:-3]

# Function to group text by duration
# @param data: List of text entries with 'text' and 'duration' keys
# @param duration_limit: Maximum duration for each group
# @return: Dictionary with grouped text entries
def group_text_by_duration(data, duration_limit=30):
    grouped_text = {}
    current_group = []
    current_duration = 0.0
    group_start_time = 0.0

    for entry in data:
        if current_duration + entry['duration'] <= duration_limit:
            current_group.append(entry['text'])
            current_duration += entry['duration']
        else:
            group_end_time = group_start_time + current_duration
            grouped_text[f"{format_time(group_start_time)}-{format_time(group_end_time)}"] = " ".join(current_group)
            group_start_time = group_end_time
            current_group = [entry['text']]
            current_duration = entry['duration']
    
    if current_group:
        group_end_time = group_start_time + current_duration
        grouped_text[f"{format_time(group_start_time)}-{format_time(group_end_time)}"] = " ".join(current_group)
    
    return grouped_text

# Route to get summary for a YouTube video
@app.route('/get_summary', methods=['POST'])
def get_summary():
    data = request.get_json()
    video_url = data.get('video_url')
    
    if not video_url:
        return jsonify({"error": "No video URL provided"}), 400
    
    transcript, en_subtitles, video_title, video_description = get_english_subtitles(video_url)
    
    if transcript is None:
        return jsonify({"error": "No subtitles found for the video."}), 404
    
    # Prompt template for the AI model to get summary
    prompt_template = f'''
    Given the following video information, create a comprehensive summary:

    VIDEO TITLE: {video_title}

    VIDEO DESCRIPTION: {video_description}

    TRANSCRIPT: {en_subtitles}

    Please provide a well-structured summary that includes:
    1. Main topic and key points
    2. Important details and insights
    3. Key conclusions or takeaways

    Format the summary in clear paragraphs and keep it concise yet informative.

    Follow the below instructions:
    1. Give headings within <h2></h2>
    2. Give paragraphs within <p></p>
    3. Give unordered list bullet points within <ul><li></li></ul>
    4. Give ordered list bullet points within <ol><li></li></ol>
    5. Enclose the bold text between <strong></strong>
    '''
    
    response = model.generate_content(prompt_template).text
    
    if response:
        return jsonify({"summary": response}), 200
    else:
        return jsonify({"error": "Failed to generate summary"}), 500

# Route to get flashcards for a YouTube video
@app.route('/get_flashcards', methods=['POST'])
def get_flashcards():    
    data = request.get_json()
    video_url = data.get('video_url')
    
    if not video_url:
        return jsonify({"error": "No video URL provided"}), 400
    
    transcript, en_subtitles, video_title, video_description = get_english_subtitles(video_url)
    
    if transcript is None:
        return jsonify({"error": "No subtitles found for the video."}), 404
    
    timestamped_data = group_text_by_duration(transcript, duration_limit=30)
    
    # Prompt template for the AI model to get flashcards
    prompt_template = f'''
        Generate flashcards in the following JSON format:
        [
            {{"heading": "Some heading", "description": "Key points from 0:00-0:30"}},
            {{"heading": "Another heading", "description": "Key points from 0:30-1:00"}}
        ]
        In text do not give the time range, just the key points.
        Use this video information:

        --
        Context:
        Title: {video_title}
        Description: {video_description}
        Content by timestamp: {timestamped_data}
        --
    '''
    
    response = model.generate_content(prompt_template)

    if response and response.text:
        try:
            cleaned_response = response.text.strip()
            cleaned_response = cleaned_response.replace('```json', '').replace('```', '').strip()
            
            if not cleaned_response.startswith('['):
                cleaned_response = cleaned_response[cleaned_response.find('['):]
            if not cleaned_response.endswith(']'):
                cleaned_response = cleaned_response[:cleaned_response.rfind(']')+1]
            
            flashcards = json.loads(cleaned_response)
            return jsonify({"flashcards": flashcards}), 200
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Raw response: {response.text}")
            return jsonify({"error": "Failed to parse AI response"}), 500
    else:
        print(f"Error in get_flashcards: {e}")
        return jsonify({"error": str(e)}), 500

# Route to get images from a YouTube video
@app.route('/get_images', methods=['POST'])
def get_images():

    try:
        data = request.get_json()
        video_url = data.get('video_url')
        if not video_url:
            return jsonify({"error": "No video URL provided"}), 400

        video_id = video_url.split("v=")[-1]
        video_path = f"temp_{video_id}.mp4"

        try:
            # Options for YouTube downloader
            ydl_opts = {
                "format": "bestvideo[height<=720]", # Download the best video quality <=720p
                "merge_output_format": "mp4",  # Ensure it merges formats
                "outtmpl": video_path,
                "quiet": True,
                "postprocessors": [{"key": "FFmpegVideoConvertor", "preferedformat": "mp4"}]
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
            
            # Extract frames from the video
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise Exception("Failed to open video file")
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            frame_interval = int(fps * 30)

            count = 0
            frames = []

            # Extract frames at 30-second intervals
            while count * frame_interval < total_frames:
                # Set the frame position
                cap.set(cv2.CAP_PROP_POS_FRAMES, count * frame_interval)
                ret, frame = cap.read()
                if not ret:
                    break

                frame_filename = f"frame_{count}.jpg"
                frame_path = os.path.join(FRAME_DIR, frame_filename)
                cv2.imwrite(frame_path, frame)
                frames.append(frame_filename)
                count += 1

            cap.release() # Release the video capture
            os.remove(video_path) # Remove the temporary video file            

            response = jsonify({"frames": frames})
            return response, 200

        except Exception as e:
            return jsonify({"error": f"Error processing video: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
