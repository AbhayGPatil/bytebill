import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

function ExpenseCharts() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/sheet-data")
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const pieData = Object.values(
    data.reduce((acc, curr) => {
      if (!acc[curr.Category]) acc[curr.Category] = { name: curr.Category, value: 0 };
      acc[curr.Category].value += parseFloat(curr.Amount);
      return acc;
    }, {})
  );

  return (
    <div className="charts">
      <h2>Expense Breakdown</h2>

      <PieChart width={400} height={300}>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      <BarChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Amount" fill="#8884d8" />
      </BarChart>
    </div>
  );
}

export default ExpenseCharts;
