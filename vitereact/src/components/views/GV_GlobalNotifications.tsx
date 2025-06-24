import React from 'react';
import { useAppStore } from "@/store/main";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

const GV_GlobalNotifications: React.FC = () => {
  // Access Zustand store
  const { notifications, auth, add_notification, remove_notification, mark_notifications_as_read } = useAppStore();

  // React Query for fetching notifications
  const fetchNotifications = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    return data.map(({ id, content, is_read, created_at }) => ({
      id,
      content,
      is_read,
      created_at,
    }));
  };

  const { data: fetchedNotifications, isLoading, isError } = useQuery(["notifications"], fetchNotifications, {
    enabled: !!auth.token, // Only fetch if authenticated
    refetchOnWindowFocus: false, // Refetch when user re-focuses the window
  });

  // React Query for marking all notifications as read
  const markAllAsRead = useMutation(() => axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/read-all`, null, {
    headers: { Authorization: `Bearer ${auth.token}` },
  }));

  // React Query for dismissing a notification
  const dismissNotification = useMutation((notificationId: string) => 
    axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notificationId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
  );

  // WebSocket notification handler
  useEffect(() => {
    const handleNewNotification = (data: { id: string; content: string }) => {
      add_notification(data.id, data.content);
    };
    window.addEventListener('notification/created', handleNewNotification);

    return () => {
      window.removeEventListener('notification/created', handleNewNotification);
    };
  }, [add_notification]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
    mark_notifications_as_read();
  };

  const handleDismissNotification = (notificationId: string) => {
    dismissNotification.mutate(notificationId);
    remove_notification(notificationId);
  };

  const panelToggle = () => {}; // Implement as required

  return (
    <div>
      <button onClick={panelToggle}>Notifications</button>
      {isNotificationsPanelOpen && (
        <div className='notifications-panel'>
          {isLoading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p>Error loading notifications</p>
          ) : fetchedNotifications?.length > 0 ? (
            fetchedNotifications.map(({ id, content, created_at }) => (
              <div key={id}>
                <p>{content}</p>
                <p>{new Date(created_at).toLocaleString()}</p>
                <button onClick={() => handleDismissNotification(id)}>Dismiss</button>
              </div>
            ))
          ) : (
            <p>No notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GV_GlobalNotifications;