import React, { useState } from "react";
import axios from "axios";
import "./BillUploader.css";

function BillUploader() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("bills", file);
    });

    setLoading(true);
    setError(null); // Reset error state before upload

    try {
      const res = await axios.post("http://localhost:5000/upload-bills", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure correct content type for file upload
        },
      });

      console.log("Response from backend:", res.data); // Check the response format

      // Ensure the response contains 'suggestions' and handle the output properly
      if (res.data && Array.isArray(res.data.suggestions)) {
        setResults(res.data.suggestions); // Update results with the suggestions
      } else {
        setResults([]); // Clear results if no suggestions found
        setError("No suggestions found in the response.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload or process the bills.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader">
      <input
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx" // Updated to allow PDF and doc files
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Bills"}
      </button>

      {error && <p className="error">{error}</p>}

      <div className="results">
        {results.length > 0 ? (
          results.map((suggestion, index) => (
            <div key={index} className="result-card">
              <h3>Generated Hack #{index + 1}</h3>
              <p>{suggestion}</p>
            </div>
          ))
        ) : (
          <p>No suggestions available.</p>
        )}
      </div>
    </div>
  );
}

export default BillUploader;
