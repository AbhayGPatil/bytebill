import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts';

const COLORS = ['#0B666A', '#35A29F', '#C5BAFF', '#C4D9FF', '#97FEED'];

const SheetChart = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true); // Start loading
        const [catRes, monthRes, recentRes, anomalyRes] = await Promise.all([
          axios.get('http://localhost:5000/category_pie'),
          axios.get('http://localhost:5000/monthly_trends'),
          axios.get('http://localhost:5000/all_data'),
          axios.get('http://localhost:5000/anomalies')
        ]);

        console.log('Category Data:', catRes.data);
        console.log('Monthly Data:', monthRes.data);
        console.log('Recent Expenses:', recentRes.data);
        console.log('Anomalies:', anomalyRes.data);

        setCategoryData(catRes.data);
        setMonthlyData(monthRes.data);
        setRecentExpenses(recentRes.data.slice(0, 5)); // last 5
        setAnomalies(anomalyRes.data);
      } catch (error) {
        console.error("Error loading insights:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchAll();
  }, []);

  // Conditional rendering based on loading state
  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="p-6 space-y-10">
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-[#071952]">Spending Breakdown (Pie)</h2>
          {categoryData.length > 0 ? (
            <PieChart width={400} height={300}>
              <Pie
                data={categoryData}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <p>No category data available</p>
          )}
        </div>

        {/* Bar Chart */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-[#071952]">Category-wise Spending (Bar)</h2>
          {categoryData.length > 0 ? (
            <BarChart width={500} height={300} data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#0B666A" />
            </BarChart>
          ) : (
            <p>No category data available</p>
          )}
        </div>
      </div>

      {/* Monthly Trends Line Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-[#071952]">Monthly Spending Trends</h2>
        {monthlyData.length > 0 ? (
          <LineChart width={800} height={300} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#35A29F" />
          </LineChart>
        ) : (
          <p>No monthly data available</p>
        )}
      </div>

      {/* Recent Uploads Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-[#071952]">Recent Uploads</h2>
        {recentExpenses.length > 0 ? (
          <table className="min-w-full border rounded-md overflow-hidden shadow text-sm text-[#071952]">
            <thead className="bg-[#C4D9FF]">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">{item.recipient}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent expense data available</p>
        )}
      </div>

      {/* Anomalies Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-red-600">⚠️ Expense Anomalies</h2>
        {anomalies.length > 0 ? (
          <table className="min-w-full border rounded-md overflow-hidden shadow text-sm text-[#071952]">
            <thead className="bg-red-100">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">{item.recipient}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2 text-red-600 font-bold">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No anomalies found</p>
        )}
      </div>
    </div>
  );
};

export default SheetChart;
