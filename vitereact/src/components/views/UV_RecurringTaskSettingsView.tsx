import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAppStore } from "@/store/main";
import { Link } from "react-router-dom";

interface TaskRecurringSettings {
  frequency: "daily" | "weekly" | "monthly";
  specificDays: string[];
}

const UV_RecurringTaskSettingsView: React.FC = () => {
  const { auth } = useAppStore();
  const [localSettings, setLocalSettings] = useState<TaskRecurringSettings>({
    frequency: "daily",
    specificDays: [],
  });

  // API Base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Query Keys
  const taskId = "123"; // Replace with dynamic URL parameter when implemented
  const queryKey = ["recurringTask", taskId];

  // Fetch Recurring Task Settings
  const fetchRecurringSettings = async () => {
    const { data } = await axios.get(`${apiBaseUrl}/api/tasks/${taskId}/recurring`, {
      headers: { Authorization: `Bearer ${auth?.token}` },
    });
    return data;
  };

  const { data, isLoading, isError, error } = useQuery(
    queryKey,
    fetchRecurringSettings,
    {
      enabled: Boolean(auth?.token), // Only fetch if the user is authenticated
    }
  );

  // Update Frequency Mutation
  const updateFrequency = useMutation(
    (newFrequency: string) =>
      axios.put(`${apiBaseUrl}/api/tasks/${taskId}/recurring`, { frequency: newFrequency }, { headers: { Authorization: `Bearer ${auth?.token}` } }),
    {
      onSuccess: () => {
        useAppStore.dispatch({ type: "add_notification", payload: { type: "success", message: "Frequency updated successfully!" } });
      },
      onError: (err: unknown) => {
        console.error("Frequency update failed", err);
        useAppStore.dispatch({ type: "add_notification", payload: { type: "error", message: "Failed to update frequency." } });
      },
    }
  );

  // Update Specific Days Mutation
  const updateSpecificDays = useMutation(
    (selectedDays: string[]) =>
      axios.put(`${apiBaseUrl}/api/tasks/${taskId}/recurring`, { specificDays: selectedDays }, { headers: { Authorization: `Bearer ${auth?.token}` } }),
    {
      onSuccess: () => {
        useAppStore.dispatch({ type: "add_notification", payload: { type: "success", message: "Specific days updated successfully!" } });
      },
      onError: (err: unknown) => {
        console.error("Specific days update failed", err);
        useAppStore.dispatch({ type: "add_notification", payload: { type: "error", message: "Failed to update specific days." } });
      },
    }
  );

  // Save Settings Mutation
  const saveRecurringSettings = useMutation(
    () =>
      axios.post(`${apiBaseUrl}/api/tasks/${taskId}/recurring`, { ...localSettings }, { headers: { Authorization: `Bearer ${auth?.token}` } }),
    {
      onSuccess: () => {
        useAppStore.dispatch({ type: "add_notification", payload: { type: "success", message: "Recurring settings saved successfully!" } });
      },
      onError: (err: unknown) => {
        console.error("Saving settings failed", err);
        useAppStore.dispatch({ type: "add_notification", payload: { type: "error", message: "Failed to save recurring settings." } });
      },
    }
  );

  // Initialize Local State from Fetch Data
  useEffect(() => {
    if (data) {
      setLocalSettings({
        frequency: data.frequency || "daily",
        specificDays: data.specificDays || [],
      });
    }
  }, [data]);

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFrequency = event.target.value as TaskRecurringSettings["frequency"];
    setLocalSettings((prev) => ({ ...prev, frequency: newFrequency }));
    updateFrequency.mutate(newFrequency);
  };

  const handleSpecificDaysChange = (newDays: string[]) => {
    setLocalSettings((prev) => ({ ...prev, specificDays: newDays }));
    updateSpecificDays.mutate(newDays);
  };

  const handleSaveClick = () => {
    saveRecurringSettings.mutate();
  };

  return (
    <>
      {isLoading && <div>Loading settings...</div>}
      {isError && <div>Error: {(error as any)?.message || "An error occurred."}</div>}

      <h1 className="text-2xl font-bold mb-4">Recurring Task Settings</h1>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Frequency</label>
          <select
            className="mt-1 block w-full rounded border shadow-sm"
            value={localSettings.frequency}
            onChange={handleFrequencyChange}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {localSettings.frequency === "weekly" && (
          <div>
            <label className="block text-sm font-medium">Specific Days</label>
            <select
              className="mt-1 block w-full rounded shadow-sm"
              multiple
              value={localSettings.specificDays}
              onChange={(e) => handleSpecificDaysChange(Array.from(e.target.selectedOptions, (opt) => opt.value))}
            >
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                <option key={day} value={day.toLowerCase()}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSaveClick}
        >
          Save Settings
        </button>
      </form>

      <div className="text-sm text-gray-600 mt-4">
        <Link to="/dashboard">Go to Dashboard</Link>
      </div>
    </>
  );
};

export default UV_RecurringTaskSettingsView;