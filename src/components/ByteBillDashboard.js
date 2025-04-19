import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataList from './DataList';
import Predicted from './Predicted';

const ByteBillDashboard = () => {
  const [allData, setAllData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryPie, setCategoryPie] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [predicted, setPredicted] = useState(null);

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataRes, trendsRes, pieRes, anomalyRes, predictRes] = await Promise.all([
          axios.get(`${BASE_URL}/all_data`),
          axios.get(`${BASE_URL}/monthly_trends`),
          axios.get(`${BASE_URL}/category_pie`),
          axios.get(`${BASE_URL}/anomalies`),
          axios.get(`${BASE_URL}/predicted_next_month`)
        ]);
        setAllData(dataRes.data);
        setMonthlyTrends(trendsRes.data);
        setCategoryPie(pieRes.data);
        setAnomalies(anomalyRes.data);
        setPredicted(predictRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 text-left">
      <DataList title="📊 Monthly Trends" data={monthlyTrends} type="trend" />
      <DataList title="📂 Category-wise Spending" data={categoryPie} type="pie" />
      <DataList title="⚠️ Anomalies" data={anomalies} type="anomaly" />
      <Predicted predicted={predicted} />
    </div>
  );
};

export default ByteBillDashboard;
