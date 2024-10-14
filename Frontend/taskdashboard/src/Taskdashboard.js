import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "./tailwind.css";
import 'react-datepicker/dist/react-datepicker.css';

const initialCount = {
  totaltasks: 0,
  New: 0,
  NotStarted: 0,
  InProgress: 0,
  DevCompleted: 0,
  Testing: 0,
  Completed: 0,
  Duetasks:0
};

const Taskdashboard = () => {
  const [taskCounts, setTaskCounts] = useState(initialCount);
  const [selectedTab, setSelectedTab] = useState('totaltasks');
  const [searchTask, setSearchTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [startdate, setStartDate] = useState(null);
  const [enddate, setEndDate] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState(''); 

  const getUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/users');
      console.log("users==",res.data)
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/tasks');
      const fetchedTasks = response.data;
      setTasks(fetchedTasks);
      calculateTasksCount(fetchedTasks);
    } catch (error) {
      setError('Error fetching tasks. Please try again later.');
      console.error('Error fetching tasks:', error);
    }
  };

  const calculateTasksCount = (tasks) => {
    const counts = { ...initialCount };
    const curdate= new Date();

  

    tasks.forEach((item) => {
      counts.totaltasks += 1;
      const taskEndDate = item.enddate ? new Date(item.enddate) : null;
      if (taskEndDate && taskEndDate < curdate) {
        counts.Duetasks += 1;
      }
      switch (item.taskstatus) {
        case 'New':
          counts.New += 1;
          break;
        case 'NotStarted':
          counts.NotStarted += 1;
          break;
        case 'InProgress':
          counts.InProgress += 1;
          break;
        case 'DevCompleted':
          counts.DevCompleted += 1;
          break;
        case 'Testing':
          counts.Testing += 1;
          break;
        case 'Completed':
          counts.Completed += 1;
          break;
        default:
          break;
      }
      console.log("count==",counts)
    });

    setTaskCounts(counts);
  };

  const addOneDay = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  };

  const searchChangeHandler = (e) => {
    setSearchTask(e.target.value);
  };

  // Filter tasks by name, tab, date range, and user
  const filteredTasks = tasks.filter((item) => {
    const taskNameMatch = item.taskname.toLowerCase().includes(searchTask.toLowerCase());
    const userMatch = searchUser === '' || item.owner.username === searchUser;
    let tabMatch;
    if (selectedTab === 'Duetasks') {
      const taskEndDate = item.enddate ? new Date(item.enddate) : null;
      tabMatch = taskEndDate && taskEndDate < new Date(); 
    } else {
      tabMatch = selectedTab === 'totaltasks' || item.taskstatus === selectedTab;
    }
    const taskStartDate = item.startdate ? new Date(addOneDay(item.startdate)) : null;
    const taskEndDate = item.enddate ? new Date(addOneDay(item.enddate)) : null;
    const startDateMatch = startdate ? (taskStartDate && taskStartDate >= startdate) : true;
    const endDateMatch = enddate ? (taskEndDate && taskEndDate <= enddate) : true;

    return taskNameMatch && tabMatch && userMatch && startDateMatch && endDateMatch;
  });

  useEffect(() => {
    getTasks();
    getUsers();
  }, []);

  return (
    <div className="p-4">
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex flex-row w-full">
        <Link to="#" className="w-full" onClick={() => setSelectedTab('totaltasks')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-2xl font-bold text-blue-500 ">Total Tasks</h3>
            <p className="text-gray-600 text-2xl pt-5">{taskCounts.totaltasks}</p>
          </div>
        </Link>
        <Link to="#" className="w-full" onClick={() => setSelectedTab('New')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-black-300 text-2xl font-bold">New</h3>
            <p className="text-gray-600 text-2xl pt-5">{taskCounts.New}</p>
          </div>
        </Link>
        <Link to="#" className="w-full" onClick={() => setSelectedTab('NotStarted')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-red-600 text-2xl font-bold">Not Started</h3>
            <p className="text-gray-600 text-2xl pt-5" >{taskCounts.NotStarted}</p>
          </div>
        </Link>
        <Link to="#" className="w-full" onClick={() => setSelectedTab('InProgress')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-orange-400 text-2xl font-bold">In Progress</h3>
            <p className="text-gray-600 text-2xl pt-5">{taskCounts.InProgress}</p>
          </div>
        </Link>
        <Link to="#" className="w-full" onClick={() => setSelectedTab('DevCompleted')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-green-400 text-2xl font-bold">Dev Completed</h3>
            <p className="text-gray-600 text-2xl pt-5">{taskCounts.DevCompleted}</p>
          </div>
        </Link>
        <Link to="#" className="w-full" onClick={() => setSelectedTab('Testing')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-pink-400 text-2xl font-bold">Testing</h3>
            <p className="text-gray-600 text-2xl pt-5">{taskCounts.Testing}</p>
          </div>
        </Link>
        <Link to="#" className="w-full" onClick={() => setSelectedTab('Completed')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-2xl text-green-600 font-bold">Completed</h3>
            <p className="text-gray-600 text-2xl pt-5">{taskCounts.Completed}</p>
          </div>
        </Link>
        <Link to="#" className="w-full" onClick={() => setSelectedTab('Duetasks')}>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 text-center shadow-md hover:bg-gray-200 transition">
            <h3 className="text-2xl text-red-600 font-bold">Due Tasks</h3>
            <p className="text-gray-600 text-2xl pt-5">{taskCounts.Duetasks}</p>
          </div>
        </Link>
      </div>

      <div className="flex justify-end mb-4">
          <select
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}  
          className="border border-gray-300 rounded-lg m-5 p-5 w-[200px] shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
        >
          <option value="">Select User</option>
          {users.map((user, index) => (
            <option key={index} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>


        <input
          type="text"
          placeholder="Search Tasks"
          value={searchTask}
          onChange={searchChangeHandler}
          className="border border-gray-300 rounded-lg m-5 p-5 w-[200px] shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
        />

        <DatePicker
          selected={startdate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startdate}
          endDate={enddate}
          placeholderText="Start Date"
          className="border border-gray-300 rounded-lg m-5 p-5 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
        />
        <DatePicker
          selected={enddate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startdate}
          endDate={enddate}
          minDate={startdate}
          placeholderText="End Date"
          className="border border-gray-300 rounded-lg m-5 p-5 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
        />
      </div>

      <div className="overflow-x-auto mt-5">
        {filteredTasks.length > 0 ? (
          <table className="min-w-full bg-white shadow-md rounded table-striped">
            <thead className="bg-pink-500">
              <tr className="text-center text-white">
                <th className="p-4">Task Name</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Task Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((item) => (
                <tr key={item._id} className="text-center">
                  <td className="p-4">{item.taskname}</td>
                  <td className="p-4">{item.startdate.split('T')[0]}</td>
                  <td className="p-4">{item.enddate.split('T')[0]}</td>
                  <td className="p-4">{item.owner.username}</td>
                  <td className="p-4">{item.taskstatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-500">No tasks found.</div>
        )}
      </div>
    </div>
  );
};

export default Taskdashboard;
