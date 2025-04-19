import React, { useState } from 'react';
import axios from 'axios';

const UploadBill = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        setResponse(res.data.data);
        onUploadSuccess && onUploadSuccess(res.data.data); // Optional callback
      } else {
        alert(`Upload failed: ${res.data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10">
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4 block mx-auto"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded transition duration-200"
      >
        {loading ? "Uploading..." : "Upload Bill"}
      </button>

      {response && (
        <div className="mt-8 p-6 bg-white rounded shadow-md text-left max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Extracted Data</h2>
          <p><strong>Date:</strong> {response.date}</p>
          <p><strong>Recipient:</strong> {response.recipient}</p>
          <p><strong>Category:</strong> {response.category}</p>
          <p><strong>Total Amount:</strong> ₹{response.amount}</p>
        </div>
      )}
    </div>
  );
};

export default UploadBill;
