import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Summary.css";

const Summary = () => {
  const ytUrl = useSelector((state) => state.ytUrl);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    if (!ytUrl) {
      setError("No video URL provided.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/get_summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_url: ytUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setLoading(false);
      } else {
        setError("Error fetching summary.");
        setLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ytUrl) {
      setLoading(true);
      setError(null);
      setSummary("");
      fetchSummary();
    }
  }, [ytUrl]);

  return (
    <div className="summary-container">
      <h2>Video Summary</h2>
      {loading && <p className="loading">Creating summary...</p>}
      {error && <p className="error">{error}</p>}
      <div className="summary-content" dangerouslySetInnerHTML={{ __html: summary }}></div>
    </div>
  );
};

export default Summary;
