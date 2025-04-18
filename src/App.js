import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import InsightsDashboard from './components/InsightsDashboard'; // Make sure this is a valid path

function App() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null); // To store BigQuery insights

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
        console.log('Upload success:', res.data);
        setResponse(res.data.data);
      } else {
        console.error('Upload failed:', res.data.message);
        alert(`Upload failed: ${res.data.message}`);
      }
    } catch (error) {
      console.error('Error during upload:', error.response ? error.response.data : error.message);
      alert('An error occurred while uploading the file.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await axios.get('http://localhost:5000/insights'); // Backend endpoint to fetch BigQuery data
      if (res.data.status === 'success') {
        setInsights(res.data.insights);
      } else {
        alert('Failed to fetch insights');
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      alert('Error fetching insights');
    }
  };

  useEffect(() => {
    fetchInsights(); // Fetch insights on page load
  }, []);

  return (
    <div className="min-h-screen p-10 bg-gray-100 text-center font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">📊 ByteBill - Bill Analyzer</h1>

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

      {/* Insights Dashboard */}
      {/* {insights && <InsightsDashboard insights={insights} />} */}
    </div>
  );
}

export default App;
