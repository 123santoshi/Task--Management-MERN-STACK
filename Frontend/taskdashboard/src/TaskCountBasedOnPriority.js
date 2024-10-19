import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './tailwind.css'; // Assuming Tailwind is being used

const TaskCountBasedOnPriority = () => {
  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');

  const getTasks = async () => {
    try {
      const res = await axios.get('http://localhost:8000/tasks');
      setTasks(res.data);
      console.log('tasks==', res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getPriorities = async () => {
    try {
      const data = (await axios.get('http://localhost:8000/tasks/priorities')).data;
      console.log('priorities==', data.Priority);
      setPriorities(data.Priority || []);
    } catch (error) {
      console.error('Error fetching priorities:', error);
    }
  };

  const getUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getBarColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return '#FF0000'; // Red for Critical
      case 'High':
        return '#FFD700'; // Yellow for High
      case 'Medium':
        return '#32CD32'; // Green for Medium
      case 'Low':
        return '#1E90FF'; // Blue for Low
      default:
        return '#8884d8'; // Default color
    }
  };

  const filterData = () => {
    const filteredTasks = searchUser ? tasks.filter((task) => task.owner.username === searchUser) : tasks;

    const result = priorities.map((priority) => {
      const statusCount = filteredTasks.filter((item) => item.taskpriority === priority).length;
      return {
        taskpriority: priority,
        taskprioritycount: statusCount,
        fill: getBarColor(priority), // Add the fill color based on priority
      };
    });
    setData(result);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getTasks();
      await getUsers();
      await getPriorities();
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [tasks, priorities, searchUser]);

  return (
    <div className="flex items-center justify-center h-screen border-2 bg-gray-100 flex-col">
      <select
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="border border-gray-300 rounded-lg m-5 p-5 w-[200px] shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ml-auto"
        >
          <option value="">Select User</option>
          {users.map((user, index) => (
            <option key={index} value={user.username}>
              {user.username}
            </option>
          ))}
      </select>
      <br/><br/><br/>
      <h1 className="text-2xl font-bold m-4 text-violet-600">Task Count Based On Priority</h1>
      <ResponsiveContainer width="50%" height={450}>
        <BarChart data={data} margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="taskpriority"
            label={{
              value: 'Task Priority',
              position: 'insideBottom',
              offset: -25,
              className: 'text-xl font-bold text-green-300 ',
              style: { fill: '#FF5733', fontWeight: 'bold' },
            }}
          />
          <YAxis
            label={{
              value: 'Task Count',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              className: 'text-2xl font-bold',
              style: { fill: 'green', fontWeight: 'bold' },
            }}
            tickFormatter={(tick) => Math.round(tick)}
            allowDecimals={false}
          />
          <Tooltip />
          
          <Bar dataKey="taskprioritycount" name="Task Count" barSize={50}>
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskCountBasedOnPriority;
