import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './SavingsSuggestions.css';


const SavingsSuggestions = () => {
  const [allData, setAllData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryPie, setCategoryPie] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [predicted, setPredicted] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allDataRes, monthlyTrendsRes, categoryPieRes, anomaliesRes, predictedRes] = await Promise.all([
          axios.get(`${BASE_URL}/all_data`),
          axios.get(`${BASE_URL}/monthly_trends`),
          axios.get(`${BASE_URL}/category_pie`),
          axios.get(`${BASE_URL}/anomalies`),
          axios.get(`${BASE_URL}/predicted_next_month`)
        ]);
        
        setAllData(allDataRes.data);
        setMonthlyTrends(monthlyTrendsRes.data);
        setCategoryPie(categoryPieRes.data);
        setAnomalies(anomaliesRes.data);
        setPredicted(predictedRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/savings_suggestions`, {
          all_data: allData,
          monthly_trends: monthlyTrends,
          category_pie: categoryPie,
          anomalies: anomalies,
          predicted_next_month: predicted
        });
        setSuggestion(res.data.suggestions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching suggestion:', err);
        setError('Failed to load suggestions.');
        setLoading(false);
      }
    };

    if (allData.length && monthlyTrends.length && categoryPie.length && anomalies.length && predicted) {
      fetchSuggestion();
    }
  }, [allData, monthlyTrends, categoryPie, anomalies, predicted]);

  const parsedSuggestions = suggestion
    .split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => line.replace(/^-\s*/, ''));

  return (
    <section className="bg-white rounded-xl shadow-md p-6 mt-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">
        💡 AI-Powered Savings Suggestions
      </h2>

      {loading && <p className="text-gray-500">Analyzing your data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && parsedSuggestions.length > 0 && (
        <ul className="space-y-3">
          {parsedSuggestions.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="bg-blue-50 text-gray-800 p-3 rounded-lg shadow-sm"
            >
              • {tip}
            </motion.li>
          ))}
        </ul>
      )}

      {!loading && !error && parsedSuggestions.length === 0 && (
        <p className="text-gray-600">No suggestions found. Try adjusting your input data.</p>
      )}
    </section>
  );
};

export default SavingsSuggestions;
