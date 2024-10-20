import React from 'react';
import './tailwind.css';
import { Link, useLocation } from 'react-router-dom';

const Home = () => {
  const location = useLocation(); // get current path
  
  return (
    <div className='w-full flex flex-row items-center justify-between bg-blue-500 h-[100px]'>
      <div className='font-bold text-lg'>
        <h1 className='text-white text-2xl m-4 p-4'>Task Management</h1>
      </div>
      <div>
        <ul className='list-none flex space-x-4 text-white text-xl m-4 p-4'>
          <Link to="/users">
            <li className={`p-4 border border-2px rounded-md hover:bg-blue-400 ${location.pathname === '/users' ? 'bg-white text-blue-500' : ''}`}>
              Users
            </li>
          </Link>
          <Link to="/tasks">
            <li className={`p-4 border border-2px rounded-md hover:bg-blue-400 ${location.pathname === '/tasks' ? 'bg-white text-blue-500' : ''}`}>
              Tasks
            </li>
          </Link>
          <Link to="/history">
            <li className={`p-4 border border-2px rounded-md hover:bg-blue-400 ${location.pathname === '/history' ? 'bg-white text-blue-500' : ''}`}>
              Activity
            </li>
          </Link>
          <Link to="/taskdashboard">
            <li className={`p-4 border border-2px rounded-md hover:bg-blue-400 ${location.pathname === '/taskdashboard' ? 'bg-white text-blue-500' : ''}`}>
              Task Dashboard
            </li>
          </Link>
          <Link to="/reports">
            <li className={`p-4 border border-2px rounded-md hover:bg-blue-400 ${location.pathname === '/reports' ? 'bg-white text-blue-500' : ''}`}>
              Reports
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
}

export default Home;
