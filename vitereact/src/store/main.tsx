import { create, Middleware, StoreApi } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { io } from 'socket.io-client';
import axios from 'axios';

type AuthState = {
  token: string;
  userId: string;
  role: 'admin' | 'manager' | 'member';
};

type UserPreferences = {
  dark_mode: boolean;
  task_view_mode: 'list' | 'kanban';
};

type Notification = {
  id: string;
  is_read: boolean;
  content: string;
  created_at: string; // ISO 8601
};

type Task = {
  id: string;
  title: string;
  status: string;
  // Add other task properties as needed
};

interface AppStoreState {
  auth: AuthState | null;
  userPreferences: UserPreferences;
  notifications: Notification[];
  login: (token: string, userId: string, role: AuthState['role']) => void;
  logout: () => void;
  add_notification: (id: string, content: string) => void;
  remove_notification: (id: string) => void;
  mark_notifications_as_read: () => Promise<void>;
  set_task_view_mode: (mode: UserPreferences['task_view_mode']) => void;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  headers: { 'Content-Type': 'application/json' },
});

const socket = io(import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'));

const persistConfig: PersistOptions<AppStoreState> = {
  name: 'taskmaster-store',
  partialize: (state) => ({
    userPreferences: state.userPreferences,
    notifications: state.notifications,
    auth: state.auth ? { 
      token: state.auth.token, 
      userId: state.auth.userId, 
      role: state.auth.role 
    } : null,
  }),
};

export const useAppStore = create<AppStoreState>(
  persist(
    (set, get) => ({
      auth: null,
      userPreferences: {
        dark_mode: false,
        task_view_mode: 'list',
      },
      notifications: [],

      login: (token, userId, role) => {
        set({ auth: { token, userId, role } });
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      },

      logout: () => {
        set({ auth: null });
        api.defaults.headers.common.Authorization = '';
        localStorage.removeItem('taskmaster-store');
      },

      add_notification: (id, content) => {
        set({ notifications: [...get().notifications, { id, is_read: false, content, created_at: new Date().toISOString() }] });
      },

      remove_notification: (id) => {
        set({ notifications: get().notifications.filter(n => n.id !== id) });
      },

      mark_notifications_as_read: async () => {
        await api.patch('/notifications/read-all');
        set({ notifications: get().notifications.map(n => ({ ...n, is_read: true })) });
      },

      set_task_view_mode: (mode) => {
        set({ userPreferences: { ...get().userPreferences, task_view_mode: mode } });
      },
    }),
    persistConfig
  )
);

socket.on('task/updated', (data: { taskId: string; updates: Partial<Task> }) => {
  console.log('Task updated via WebSocket:', data);
  // Update logic could be handled here if required globally.
});

socket.on('notification/created', (data: Notification) => {
  useAppStore.getState().add_notification(data.id, data.content);
});