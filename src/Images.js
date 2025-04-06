import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Images = () => {
  const ytUrl = useSelector((state) => state.ytUrl);
  console.log(ytUrl);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImages = async () => {
    if (!ytUrl) {
      setError("No video URL provided.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/get_images', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_url: ytUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      if(data.frames) {
        setImages(data.frames);
        setLoading(false);
      }
      else {
        setError('No images available');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!ytUrl) {
      return;
    }
    setImages([]);
    setError(null);
    setLoading(true);
    fetchImages();
  }, [ytUrl]);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Extracted Frames</h1>
      {loading && <p className="text-gray-500">Fetching frames from video...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {images.map((img, i) => (
          <img
            key={i}
            src={`http://localhost:5000/frames/${img}`}
            alt={`Frame ${i}`}
            className="w-full h-auto rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
          />
        ))}
      </div>
    </div>
  );
};

export default Images;