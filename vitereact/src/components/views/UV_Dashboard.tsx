import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/main";

interface TaskSummary {
  task_id: string;
  title: string;
  priority: string;
  due_date: string;
}

interface Notification {
  id: string;
  content: string;
}

const UV_Dashboard: React.FC = () => {
  const auth = useAppStore((state) => state.auth);
  const userPreferences = useAppStore((state) => state.userPreferences);
  const [activeView, setActiveView] = useState("overview");

  // Fetch task summaries
  const { data: taskSummaries, isLoading, error } = useQuery(
    ["taskSummaries"],
    fetchTasks
  );

  // Fetch notifications
  const { data: notifications } = useQuery(
    ["notifications"],
    fetchNotifications
  );

  // Fetch data from the backend
  const fetchTasks = async () => {
    try {
      const response = await axios.get<TaskSummary[]>(
        `${import.meta.env.VITE_API_BASE_URL}/api/tasks/summary`,
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      return response.data;
    } catch (e) {
      console.error("Failed to fetch tasks", e);
      throw new Error("Failed to fetch tasks");
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get<Notification[]>(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications`,
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      return response.data;
    } catch (e) {
      console.error("Failed to fetch notifications", e);
      throw new Error("Failed to fetch notifications");
    }
  };

  // WebSocket listeners (commented out until socket is properly implemented)
  useEffect(() => {
    // TODO: Implement WebSocket connection
    /*
    const handleTaskUpdated = (data: { taskId: string; updates: Partial<TaskSummary> }) => {
      console.log("Task updated:", data);
    };

    const handleNotification = (data: Notification) => {
      useAppStore.getState().add_notification(data.id, data.content);
    };

    socket.on("task/updated", handleTaskUpdated);
    socket.on("notification/created", handleNotification);

    return () => {
      socket.off("task/updated", handleTaskUpdated);
      socket.off("notification/created", handleNotification);
    };
    */
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <GV_TopNav />

      {/* Dashboard Content */}
      <div className="p-6 bg-white rounded-lg shadow m-4">
        {/* Header */}
        <h1 className="text-lg font-bold">Dashboard</h1>

        {/* Task Summaries */}
        <div className="mt-4">
          <h2 className="text-md font-semibold">Upcoming Tasks</h2>
          {isLoading && <p>Loading tasks...</p>}
          {error && <p>Error fetching tasks.</p>}
          {taskSummaries?.length === 0 && <p>No tasks found.</p>}
          {taskSummaries?.map((task) => (
            <div
              key={task.task_id}
              className="flex items-center justify-between p-2 bg-gray-100 rounded mt-2"
            >
              <p>
                <span className="font-bold">{task.title}</span> - Priority:{" "}
                {task.priority}
              </p>
              <p className="text-sm text-gray-500">{task.due_date}</p>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="mt-6">
          <h2 className="text-md font-semibold">Notifications</h2>
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center p-2 bg-blue-100 rounded mt-2"
            >
              <p>{notification.content}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <button
            onClick={() => setActiveView("overview")}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Overview
          </button>
          <Link to="/tasks" className="px-4 py-2 bg-green-500 text-white rounded ml-2">
            View All Tasks
          </Link>
          <Link to="/reports" className="px-4 py-2 bg-yellow-500 text-white rounded ml-2">
            Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UV_Dashboard;