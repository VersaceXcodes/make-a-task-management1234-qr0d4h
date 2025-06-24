import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

interface Task {
  task_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

const fetchTasks = async ({ queryKey }: { queryKey: string[] }) => {
  const [, filters] = queryKey;
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
    params: JSON.parse(filters) || {},
  });
  return data.tasks;
};

const UV_TaskListView: React.FC = () => {
  const { auth } = useAppStore();
  const [appliedFilters, setAppliedFilters] = useState<{ status?: string; priority?: string }>({}); // Fixed: Enforce a stable query key structure
  const [isLoading, setIsLoading] = useState(false);

  const { data: tasks = [], error, isFetching, refetch } = useQuery<Task[]>(['tasks', JSON.stringify(appliedFilters)], fetchTasks, {
    enabled: !!auth,
    onSuccess: () => setIsLoading(false),
    onError: () => setIsLoading(false),
  });

  useEffect(() => {
    refetch();
  }, [appliedFilters, refetch]);

  const updateFilters = (newFilters: { status?: string; priority?: string }) => {
    setAppliedFilters(newFilters);
  };

  return (
    <>
      {/* Filters Section */}
      <div className="flex justify-between items-center p-4 bg-gray-200">
        <div>
          <h1 className="text-lg font-bold">Task List</h1>
        </div>
        <div>
          <select
            className="px-3 py-1 border rounded"
            value={appliedFilters.status || ''}
            onChange={(e) => updateFilters({ status: e.target.value || undefined })}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="px-3 py-1 border rounded ml-2"
            value={appliedFilters.priority || ''}
            onChange={(e) => updateFilters({ priority: e.target.value || undefined })}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      <div className="loader">{isLoading && 'Loading...'}</div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {tasks.map((task) => (
          <div
            key={task.task_id}
            className="bg-white shadow rounded p-4 hover:bg-gray-50 transition"
          >
            <h2 className="font-bold text-lg">{task.title}</h2>
            <p className="text-sm text-gray-600">{task.description}</p>
            <div className="text-sm">
              <span className="badge bg-blue-500 text-white mr-2">
                Status: {task.status}
              </span>
              <span className="badge bg-green-500 text-white">Priority: {task.priority}</span>
            </div>
            <div className="mt-4">
              <Link to={`/tasks/${task.task_id}`} className="bg-blue-500 text-white px-4 py-2 rounded">
                View Details
              </Link>
            </div>
          </div>
        ))}
        {!tasks.length && !isLoading && <div>No tasks found.</div>}
      </div>

      {/* Fallback for Errors */}
      {error && <div>Error fetching tasks: {error.message}</div>}

      {/* Loading Indicator */}
      {isFetching && tasks.length > 0 && <div>Updating tasks...</div>}
    </>
  );
};

export default UV_TaskListView;