import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/main";
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

const fetchTaskDetails = async ({ queryKey }: { queryKey: [string, string] }) => {
  const [_key, taskId] = queryKey;
  const { data } = await axios.get(`/api/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${useAppStore().auth?.token}` },
  });
  return data;
};

const updateTaskDetails = async ({
  queryKey,
  taskUpdates,
}: {
  queryKey: [string, string];
  taskUpdates: Partial<Task>;
}) => {
  const [_key, taskId] = queryKey;
  const { data } = await axios.put(`/api/tasks/${taskId}`, taskUpdates, {
    headers: { Authorization: `Bearer ${useAppStore().auth?.token}` },
  });
  return data;
};

const UV_TaskDetailsView: React.FC = () => {
  const { auth } = useAppStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const queryClient = useQueryClient();

  const { data, error, isFetching } = useQuery(
    ["task_details", location.pathname.split("/").pop() ?? ""],
    fetchTaskDetails,
    {
      onSuccess: (data) => setTask(data.task),
      onError: (err) => setErrorMessage(err.message),
    }
  );

  const handleEditTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTask((prev) => ({ ...prev, title: newTitle }));
  }, []);

  const handleSaveTitle = () => {
    if (task) {
      updateTaskDetails({ queryKey: ["task_details", task.id], taskUpdates: { title: task.title } });
    }
  };

  if (isFetching || !task) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full border-4 border-t-transparent border-gray-300"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <section className="container mx-auto py-6">
          <header className="flex justify-between items-center">
            <Link to="/tasks" className="text-sm font-medium text-gray-500">
              <IoArrowBack /> Back to Task List
            </Link>
            <button
              onClick={() => queryClient.invalidateQueries(["task_details", task.id])}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Refresh
            </button>
          </header>

          <h1 className="text-lg font-semibold text-gray-800 mt-4">Task Details</h1>
          {errorMessage && <div className="text-red-500">Error: {errorMessage}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTitle();
            }}
            className="mt-4"
          >
            <div className="mb-4">
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">
                Task Title
              </label>
              <input
                id="task-title"
                type="text"
                value={task.title || ""}
                onChange={handleEditTitle}
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                disabled={isFetching}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

export default UV_TaskDetailsView;