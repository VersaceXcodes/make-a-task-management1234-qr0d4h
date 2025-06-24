import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/main";
import { Link } from "react-router-dom";

const UV_Landing: React.FC = () => {
  const { auth } = useAppStore((state) => state);
  const [isHeroAnimationComplete, setIsHeroAnimationComplete] = useState(false);

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (auth) {
      window.location.href = "/dashboard";
    }
  }, [auth]);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-900">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white sm:text-5xl">
              Welcome to TaskMaster
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              Simplify your tasks, organize your projects, and achieve more with ease.
            </p>
            <div className="mt-8">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </div>
          </div>
        </div>
        {/* Hero Animation Placeholder */}
        {!isHeroAnimationComplete ? (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="loader"></div>
          </div>
        ) : null}
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            Why Choose TaskMaster?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="p-4 bg-white shadow-lg dark:bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
                Task Management
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Easily manage tasks with deadlines, priorities, and notifications.
              </p>
            </div>
            <div className="p-4 bg-white shadow-lg dark:bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
                Collaboration
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Share tasks, comment, and collaborate with your team in real-time.
              </p>
            </div>
            <div className="p-4 bg-white shadow-lg dark:bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
                Customizable Views
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Switch between list, kanban, or calendar views for your tasks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="container mx-auto py-12 px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join thousands of users who are already boosting their productivity with TaskMaster.
          </p>
          <div className="mt-8">
            <Link to="/login" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UV_Landing;