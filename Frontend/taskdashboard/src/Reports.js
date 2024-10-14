import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Reports = () => {
  const location = useLocation();

  // Helper function to apply active styling
  const getActiveStyle = (path) => {
    return location.pathname.includes(path)
      ? 'bg-blue-500 text-white' // Active tab styles
      : 'text-blue-500 bg-gray-200'; // Default tab styles
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-gray-100 p-6">
        <ul className="space-y-6">
          <Link to="timelogreport">
            <li className={`w-full mb-5 text-2xl border border-2 p-10 rounded-md hover:underline ${getActiveStyle('timelogreport')}`}>
              LogTime Report
            </li>
          </Link>

          <Link to="taskcountstatus">
            <li className={`w-full mb-5 text-2xl border border-2 p-10 rounded-md hover:underline ${getActiveStyle('taskcountstatus')}`}>
              Tasks Count Based On The Task Status
            </li>
          </Link>

          <Link to="taskcountusers">
            <li className={`w-full mb-5 text-2xl border border-2 p-10 rounded-md hover:underline ${getActiveStyle('taskcountusers')}`}>
              Tasks Count Based On The Users
            </li>
          </Link>

          <Link to="totaltasktime">
            <li className={`w-full mb-5 text-2xl border border-2 p-10 rounded-md hover:underline ${getActiveStyle('totaltasktime')}`}>
              Task Time Report
            </li>
          </Link>
        </ul>
      </div>

      <div className="w-4/5 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Reports;
