import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import Global Shared Views that exist
import GV_GlobalSidebar from "@/components/views/GV_GlobalSidebar.tsx";
import GV_GlobalFooter from "@/components/views/GV_GlobalFooter.tsx";
import GV_GlobalNotifications from "@/components/views/GV_GlobalNotifications.tsx";

// Import Lazy-Loaded Views that exist
const UV_Landing = lazy(() => import("@/components/views/UV_Landing.tsx"));
const UV_Dashboard = lazy(() => import("@/components/views/UV_Dashboard.tsx"));
const UV_TaskListView = lazy(() => import("@/components/views/UV_TaskListView.tsx"));
const UV_TaskDetailsView = lazy(() => import("@/components/views/UV_TaskDetailsView.tsx"));
const UV_ReportsView = lazy(() => import("@/components/views/UV_ReportsView.tsx"));
const UV_RecurringTaskSettingsView = lazy(() => import("@/components/views/UV_RecurringTaskSettingsView.tsx"));
const UV_KanbanView = lazy(() => import("@/components/views/UV_KanbanView.tsx"));

// Import Zustand Store
import { useAppStore } from "@/store/main";

// Initialize Query Client
const queryClient = new QueryClient();

const App: React.FC = () => {
  const navigate = useNavigate();
  const { auth, userPreferences } = useAppStore();

  useEffect(() => {
    // Check and hydrate auth state from local storage
    const token = localStorage.getItem("authToken");
    if (token) {
      useAppStore.setState({ auth: { token, userId: "user123", role: "admin" } });
    }
  }, []);

  const handleLogout = () => {
    useAppStore.getState().logout();
    navigate("/");
  };

  // Enhanced login component with proper form structure
  const SimpleLogin = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <h2 className="text-lg text-gray-600 mb-8">Sign in to your TaskMaster account</h2>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            useAppStore.getState().login("demo-token", "user123", "admin");
            navigate("/dashboard");
          }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                defaultValue="demo@taskmaster.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                defaultValue="password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign In (Demo)
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <p>Demo credentials are pre-filled for testing</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Enhanced top navigation component with proper H1 and navigation links
  const TopNav = ({ isAuthenticated, onLogout }: { isAuthenticated: boolean; onLogout: () => void }) => (
    <header>
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold">
              <Link to="/" className="hover:text-blue-200">TaskMaster</Link>
            </h1>
            {isAuthenticated && (
              <div className="flex space-x-4">
                <Link to="/dashboard" className="hover:text-blue-200 px-3 py-2 rounded transition-colors">
                  Dashboard
                </Link>
                <Link to="/tasks" className="hover:text-blue-200 px-3 py-2 rounded transition-colors">
                  Tasks
                </Link>
                <Link to="/kanban" className="hover:text-blue-200 px-3 py-2 rounded transition-colors">
                  Kanban
                </Link>
                <Link to="/reports" className="hover:text-blue-200 px-3 py-2 rounded transition-colors">
                  Reports
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <Link to="/login" className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 transition-colors">
                Login
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <TopNav
            isAuthenticated={Boolean(auth?.token)}
            onLogout={handleLogout}
          />
          
          <div className="flex flex-1">
            {auth?.token && (
              <aside className="hidden md:block bg-white shadow-sm">
                <GV_GlobalSidebar />
              </aside>
            )}
            
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Outlet />}>
                  <Route index element={<UV_Landing />} />
                  <Route path="login" element={<SimpleLogin />} />
                </Route>

                {/* Authenticated Routes */}
                <Route
                  path="/dashboard"
                  element={
                    auth?.token ? (
                      <UV_Dashboard />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    auth ? (
                      <UV_TaskListView />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/tasks/:task_id"
                  element={
                    auth ? (
                      <UV_TaskDetailsView />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/reports"
                  element={
                    auth ? (
                      <UV_ReportsView />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/settings/recurring"
                  element={
                    auth ? (
                      <UV_RecurringTaskSettingsView />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/kanban"
                  element={
                    auth ? (
                      <UV_KanbanView />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={
                  <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                    <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      Go Home
                    </Link>
                  </div>
                } />
              </Routes>
            </main>
          </div>

          <GV_GlobalNotifications />
          <GV_GlobalFooter />
        </div>
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;