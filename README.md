
## 📌 YouTube Summarizer

### 📝 **Project Overview**

The **YouTube Summarizer** is a tool that extracts transcripts from YouTube videos and generates concise summaries using AI. This helps users quickly understand video content without watching the entire video.

----------

### 🚀 **Features**

-   📌 **Fetches YouTube Video Details** – Extracts metadata (title, description, etc.).
-   🗣 **Retrieves Video Transcript** – Uses YouTube API to fetch subtitles (if available).
-   🧠 **AI-Powered Summarization** – Processes the transcript and generates a meaningful summary.
-   📜 **User-Friendly Output** – Provides a clear and concise text summary.

----------

### 🏗 **How It Works**

1.  The **User** provides a YouTube video URL.
2.  The system fetches the **video details and transcript** from the **YouTube API**.
3.  The **Summarizer AI** processes the transcript and creates a **short summary** using locally installed LLMs using **Ollama**.
4.  The summary is **displayed to the user** for easy consumption.

----------

### 📦 **Tech Stack**

-   **Backend:** Python / Node.js
-   **APIs:** YouTube Data API, AI Text Summarization Model
-   **Frontend:** React / HTML + CSS (Optional)
-   **Libraries:** Requests, Transformers (Hugging Face) / OpenAI API

----------

### 📜 **Installation & Setup**

1.  Clone this repository:
    
    ```bash 
    git clone https://github.com/krishng03/youtube-summarizer.git    
2.  Install dependencies (Create virtual environment):
    
	1. ```bash
		pip install requirements.txt    
	2. ```bash
		npm install	   
3.  Run the application:
	1. Run `py server.py` in one terminal
	2. Run `npm run start` in other terminal respectively  

----------

### 🎯 **Usage**

1.  Open the app and **paste a YouTube video link**.
2.  Click **Summarize** to process the transcript.
3.  Read the **AI-generated summary** in seconds!
