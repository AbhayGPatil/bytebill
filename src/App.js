import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadBill from './components/UploadBill';
import Dashboard from './components/Dashboard';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen p-10 bg-gray-100 font-sans text-center">
        <h1 className="text-3xl font-bold mb-8 text-blue-800">📊 ByteBill - Bill Analyzer</h1>

        {/* 🔹 Navigation Buttons */}
        <div className="mb-8 space-x-4">
          <Link to="/upload">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Upload Bill
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              View Dashboard
            </button>
          </Link>
        </div>

        {/* 🔹 Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadBill />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
