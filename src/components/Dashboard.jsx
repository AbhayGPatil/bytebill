import React from 'react';
import SheetChart from './SheetChart';
import ByteBillDashboard from './ByteBillDashboard';  // Adjust path if necessary
import SavingsSuggestions from './SavingsSuggestions';


const Dashboard = () => {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-[#071952]">📈 Dashboard Insights</h2>
      <SheetChart />
      <ByteBillDashboard />
      <SavingsSuggestions/>
    </div>
  );
};

export default Dashboard;
