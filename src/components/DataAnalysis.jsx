import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DataAnalysis = ({ subscriptions }) => {
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const price = parseFloat(sub.price);
    return sub.period === 'monthly' ? sum + price : sum + price / 12;
  }, 0);
  const weekly = totalMonthly / 4.33;
  const yearly = totalMonthly * 12;

  const generateMonthlyData = () => {
    if (subscriptions.length === 0) return [];
    
    const earliestDate = subscriptions.reduce((earliest, sub) => {
      const subDate = new Date(sub.firstBillDate);
      return subDate < earliest ? subDate : earliest;
    }, new Date());

    const currentDate = new Date();

    const months = [];
    const tempDate = new Date(earliestDate);

    tempDate.setDate(1);

    while (tempDate <= currentDate) {
      months.push(new Date(tempDate));
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    return months.map(month => {
      const monthStr = month.toISOString().slice(0, 7);

      let monthlySpending = 0;
      
      subscriptions.forEach(sub => {
        const subStartDate = new Date(sub.firstBillDate);
        if (subStartDate <= month) {
          const price = parseFloat(sub.price);
          monthlySpending += sub.period === 'monthly' ? price : price / 12;
        }
      });
      
      return {
        month: monthStr,
        spending: monthlySpending.toFixed(2),
        accumulated: monthlySpending.toFixed(2)
      };
    });
  };

  const calculateAccumulated = (data) => {
    let accumulated = 0;
    return data.map(item => {
      accumulated += parseFloat(item.spending);
      return {
        ...item,
        accumulated: accumulated.toFixed(2)
      };
    });
  };

  const monthlyData = calculateAccumulated(generateMonthlyData());

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Data Analysis</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">Average Monthly Cost</p>
          <p className="text-lg font-semibold text-blue-600">{totalMonthly.toFixed(2)} USD</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600">Average Weekly Cost</p>
          <p className="text-lg font-semibold text-green-600">{weekly.toFixed(2)} USD</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600">Average Yearly Cost</p>
          <p className="text-lg font-semibold text-purple-600">{yearly.toFixed(2)} USD</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="spending"
            name="Monthly Spending"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="accumulated"
            name="Accumulated Spending"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: '#10b981' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataAnalysis;