import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import "./tailwind.css"; // Assuming Tailwind is being used

const TaskCountBasedOnStatus = () => {
  const [tasks, setTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');

  const getTasks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/tasks");
      setTasks(res.data);
      console.log("tasks==", res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const getTaskStatus = async () => {
    try {
     
        const data = (await axios.get("http://localhost:8000/tasks/taskstatus")).data;
        setTaskStatuses(data.TaskStatus);
    }
    catch (error) {
      console.error("Error fetching task statuses:", error);
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

  const filterData = () => {
    const filteredTasks = searchUser ? tasks.filter(task => task.owner.username === searchUser) : tasks;

    const result = taskStatuses.map((status) => {
      const statusCount = filteredTasks.filter((item) => item.taskstatus === status).length;
      return {
        taskstatus: status,
        taskstatuscount: statusCount
      };
    });
    setData(result);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getTaskStatus();
      await getTasks();
      await getUsers();
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [tasks, taskStatuses, searchUser]);

  return (
    <div className="flex items-center h-screen border-2 bg-gray-100 flex-col">
    
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
      <h1 className="w-auto text-2xl font-bold m-4 text-violet-600">Task Count Based On Status</h1>
      <ResponsiveContainer className="w-auto" height={450}>
        <BarChart data={data} margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="taskstatus" 
              label={{ 
                value: 'Task Status', 
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
            <Bar dataKey="taskstatuscount" fill="#8884d8" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    
  );
}

export default TaskCountBasedOnStatus;
