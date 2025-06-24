import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer } from 'recharts';

const fetchReports = async () => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/reports`);
    useAppStore.setState({ reports: data }); // Dispatch to Redux store
  } catch (error) {
    console.error('Error fetching reports:', error);
  }
};

export default function ReportsView() {
  useEffect(() => { fetchReports(); }, []);

  const chartConfig = {
    tasks: {
      label: "Tasks",
      color: "#2563eb",
    },
  };

  // Mock data for the chart when reports are not available
  const reportData = useAppStore().reports || [
    { name: "This Week", tasks: 4 },
    { name: "Last Week", tasks: 3 },
    { name: "Two Weeks Ago", tasks: 7 },
    { name: "Three Weeks Ago", tasks: 2 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <ChartContainer config={chartConfig} className="h-[400px]">
        <BarChart data={reportData}>
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="tasks" fill="var(--color-tasks)" />
        </BarChart>
      </ChartContainer>
    </div>
  );
}