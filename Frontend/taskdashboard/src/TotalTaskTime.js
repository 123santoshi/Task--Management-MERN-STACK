import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "./tailwind.css";
import 'react-datepicker/dist/react-datepicker.css';

const TimeLogReport = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTask, setSearchTask] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [startdate, setStartDate] = useState(null);
  const [enddate, setEndDate] = useState(null);
  const [error, setError] = useState('');

  const getUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/users');
      setUsers(res.data);
    } catch (error) {
      setError('Error fetching users. Please try again later.');
      console.error('Error fetching users:', error);
    }
  };

  const getTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/tasks');
      const fetchedTasks = response.data;
      setTasks(fetchedTasks);
      console.log("fetched tasks==", fetchedTasks);
    } catch (error) {
      setError('Error fetching tasks. Please try again later.');
      console.error('Error fetching tasks:', error);
    }
  };

  const addOneDay = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  };


  //convet time into sec 
  const convertToSec = (spent_time) => {
    if (!spent_time || spent_time.length === 0) return 0; // Handle empty or undefined spent_time
    
    console.log("spent_time==", spent_time);
    const get_time = spent_time.map(item => item.time);
    console.log("log time==", get_time);
    let total = 0;
    get_time.forEach(time => {
        const split_time = time.split(":");
        const hours = parseInt(split_time[0]) || 0; 
        const minutes = parseInt(split_time[1]) || 0; 
        const seconds = parseInt(split_time[2]) || 0; 
        total += (hours * 3600) + (minutes * 60) + seconds;
    });
    
    console.log("Total seconds==", total);

    const hrs = Math.floor(total / 3600); 
    const mins = Math.floor((total % 3600) / 60); 
    const secs = total % 60; 
    const total_time = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    console.log("Formatted time==", total_time);
    return total_time;
  };


  const searchChangeHandler = (e) => {
    setSearchTask(e.target.value);
  };

  // Filter tasks by name, date range, and user
  const filteredTasks = tasks.filter((item) => {
    const taskNameMatch = item.taskname.toLowerCase().includes(searchTask.toLowerCase());
    const userMatch = searchUser === '' || item.owner.username === searchUser;

    const dateMatches = item.spent_time.some(log => {
      const logDate = new Date(log.logdate); 
      console.log("logdate==", logDate);
      const isStartDateValid = !startdate || logDate >= startdate; // Check start date
      console.log("isstartvalid==", isStartDateValid);
      const isEndDateValid = !enddate || logDate <= addOneDay(enddate); // Check end date
      console.log("isendvalid==", isEndDateValid);
      return isStartDateValid && isEndDateValid; // Return true if log date is within range
    });

    return taskNameMatch && userMatch && dateMatches;
  });

  useEffect(() => {
    getTasks();
    getUsers();
  }, []);

  return (
    <div className="p-4">
      {error && <div className="text-red-500">{error}</div>} {/* Display error message if any */}
      
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
                <th className="p-4">Owner</th>
                <th className="p-4">Task Status</th>
                <th className="p-4">Log Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((item) => (
                <tr key={`${item._id}`} className="text-center">
                  <td className="p-4">{item.taskname}</td>
                  <td className="p-4">{item.owner.username}</td>
                  <td className="p-4">{item.taskstatus}</td>
                  <td className="p-4">{convertToSec(item.spent_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-500">No Time Logs found.</div>
        )}
      </div>
    </div>
  );
};

export default TimeLogReport;
