import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Cards = () => {
  const ytUrl = useSelector((state) => state.ytUrl);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFlashcards = async () => {
    if (!ytUrl) {
      setError("No video URL provided.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/get_flashcards", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_url: ytUrl }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.flashcards) {
        setFlashcards(data.flashcards);
        setLoading(false);
      } else {
        setError("No flashcards available");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setError(`Error processing flashcards: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ytUrl) {
      setFlashcards([]);
      setError(null);
      setLoading(true);
      fetchFlashcards();
    }
  }, [ytUrl]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Flashcards</h2>
      <div className="space-y-4">
        {loading && <p className="text-gray-500">Loading flashcards...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {flashcards.length > 0 ? (
          flashcards.map((card, index) => (
            <div key={index} className="p-4 bg-white shadow-md rounded-lg">
              <h3 className="font-semibold text-lg">{card.heading}</h3>
              <p className="text-gray-700">{card.description}</p>
            </div>
          ))
        ) : (
          !loading && <p className="text-gray-500">No flashcards available.</p>
        )}
      </div>
    </div>
  );
};

export default Cards;