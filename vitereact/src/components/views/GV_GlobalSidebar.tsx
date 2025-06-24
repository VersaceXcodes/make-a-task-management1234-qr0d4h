import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import clsx from 'clsx';

const GV_GlobalSidebar: React.FC = memo(() => {
  // Access Zustand Store State
  const { isSidebarCollapsed } = useAppStore((state) => ({
    isSidebarCollapsed: state.isSidebarCollapsed,
  }));

  // Classes and Utilities
  const sidebarClass = clsx(
    'fixed top-0 left-0 h-full w-64 transition-all duration-500 ease-in-out',
    'bg-gray-800 text-white shadow-lg',
    { 'w-16': isSidebarCollapsed },
    { 'w-64': !isSidebarCollapsed }
  );

  const contentClass = clsx('p-6 flex flex-col space-y-6', {
    'hidden': isSidebarCollapsed, // Hide text content when collapsed
  });

  const toggleSidebar = () => {
    useAppStore.setState({ isSidebarCollapsed: !isSidebarCollapsed });
  };

  return (
    <aside id="sidebar" className={sidebarClass}>
      {/* Sidebar Toggle Button */}
      <button
        className="absolute top-4 right-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center"
        onClick={toggleSidebar}
        aria-expanded={!isSidebarCollapsed}
        aria-label="Toggle Sidebar"
        aria-controls="sidebar"
      >
        <span className="material-icons text-2xl">
          {isSidebarCollapsed ? 'chevron_right' : 'menu'}
        </span>
      </button>

      {/* Sidebar Content */}
      <div className={contentClass}>
        {/* Navigation Links */}
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 transition hover:bg-gray-700 p-3 rounded"
        >
          <span className="material-icons text-lg">dashboard</span>
          <span className={clsx({ 'hidden': isSidebarCollapsed })}>
            Dashboard
          </span>
        </Link>

        <Link
          to="/tasks"
          className="flex items-center space-x-2 transition hover:bg-gray-700 p-3 rounded"
        >
          <span className="material-icons text-lg">task</span>
          <span className={clsx({ 'hidden': isSidebarCollapsed })}>
            Tasks
          </span>
        </Link>

        <Link
          to="/projects"
          className="flex items-center space-x-2 transition hover:bg-gray-700 p-3 rounded"
        >
          <span className="material-icons text-lg">folder</span>
          <span className={clsx({ 'hidden': isSidebarCollapsed })}>
            Projects
          </span>
        </Link>

        <Link
          to="/reports"
          className="flex items-center space-x-2 transition hover:bg-gray-700 p-3 rounded"
        >
          <span className="material-icons text-lg">insights</span>
          <span className={clsx({ 'hidden': isSidebarCollapsed })}>
            Reports
          </span>
        </Link>
      </div>
    </aside>
  );
});

export default GV_GlobalSidebar;