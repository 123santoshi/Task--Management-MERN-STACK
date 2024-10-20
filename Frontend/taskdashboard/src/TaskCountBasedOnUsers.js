import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import "./tailwind.css"; // Assuming Tailwind is being used

const TaskCountBasedOnUsers = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);

  const getTasks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const getUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/users/activeusers');
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
    const result = users.map((user) => {
      const userTasks = tasks.filter((task) => task.owner.username === user.username);
      const taskCount = userTasks.length;
      const priority = userTasks.length > 0 ? userTasks[0].priority : 'None'; // Assuming priority comes from the first task
      
      return {
        user: user.username,
        taskscount: taskCount,
       
      };
    });
    setData(result);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getTasks();
      await getUsers();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && users.length > 0) {
      filterData();
    }
  }, [tasks, users]);

  return (
    <div className='w-[auto] flex items-center  justify-center h-screen border-2 bg-gray-100 flex-col'>
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Tasks Count Per User</h1>
      <ResponsiveContainer  height={450}>
        <BarChart data={data} margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="user" 
            label={{ 
              value: 'Users', 
              position: 'insideBottom', 
              offset: -30,
              className: 'text-xl font-bold text-green-300',
              style: { fill: '#FF5733', fontWeight: 'bold' } 
            }} 
          />
          <YAxis 
            label={{ 
              value: 'Task Count', 
              angle: -90, 
              position: 'insideLeft', 
              offset: 10, 
              className: 'text-xl font-bold',
              style: { fill: 'green', fontWeight: 'bold' } 
            }}
            tickFormatter={(tick) => Math.round(tick)}
            allowDecimals={false}
          />
          <Tooltip />
         
          <Bar dataKey="taskscount" fill="#8884d8" barSize={100} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskCountBasedOnUsers;
