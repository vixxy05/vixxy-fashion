
import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { API_BASE } from '../config/env';

const API_URL = API_BASE;

const AISellingDashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    conversionRate: 0,
    totalActions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/ai-selling/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: ['Total Sessions', 'Completed Sessions', 'Total Actions'],
    datasets: [
      {
        label: 'AI Selling Stats',
        data: [stats.totalSessions, stats.completedSessions, stats.totalActions],
        backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Selling Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalSessions}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Completed Sessions</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold text-indigo-600">
            {stats.conversionRate.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Actions</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalActions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">AI Selling Overview</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold text-indigo-600">
                {stats.conversionRate.toFixed(2)}%
              </p>
              <p className="text-gray-500 mt-2">Of sessions completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISellingDashboard;
