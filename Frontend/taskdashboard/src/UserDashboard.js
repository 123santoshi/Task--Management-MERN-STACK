import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "./tailwind.css";
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaStop } from 'react-icons/fa'; 

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [userTasks, setUserTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [taskStatus, setTaskStatus] = useState([]);
    const [time, setTime] = useState(0);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [error, setError] = useState(null); 
    const navigate = useNavigate();

    const fetchUserTasks = () => {
        const user_name = localStorage.getItem('username');
        const filteredTasksForUser = tasks.filter((item) => item.owner.username === user_name);
        setUserTasks(filteredTasksForUser);
    };

    const getTasks = async () => {
        try {
            const response = await axios.get("http://localhost:8000/tasks");
            setTasks(response.data);
        } catch (error) {
            setError('Failed to fetch tasks');
            console.error('Error fetching tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const getTaskStatus = async () => {
        try {
            const response = await axios.get("http://localhost:8000/tasks/taskstatus");
            setTaskStatus(response.data.taskstatus);
        } catch (error) {
            setError('Failed to fetch task statuses');
            console.error('Error fetching task statuses:', error);
        } finally {
            setLoadingStatus(false);
        }
    };

    const searchHandler = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredTasks = tasks.filter((item) =>
        item.taskname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.taskstatus.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:8000/tasks/${id}`, { taskstatus: newStatus });
            const updatedTask = response.data;
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const timeLog = async (id) => {
        const logtime = convertSecToHrs(time);
        try {
            await axios.post(`http://localhost:8000/tasks/logtime/${id}`, { time: logtime });
        } catch (error) {
            console.error("Error logging time:", error);
        }
    };

    const convertSecToHrs = (sec) => {
        const mins = Math.floor(sec / 60);
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        const remainingSecs = sec % 60;
        return `${String(hrs).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`; 
    };

    const taskAction = (id) => {
        if (activeTaskId === id) {
            clearInterval(intervalId);
            setIntervalId(null);
            timeLog(id);
            setActiveTaskId(null);
            setTime(0);
        } else {
            if (intervalId) clearInterval(intervalId);
            setTime(0);
            setActiveTaskId(id);
            const newIntervalId = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
            setIntervalId(newIntervalId);
        }
    };

    useEffect(() => {
        getTasks();
        getTaskStatus();
    }, []);

    useEffect(() => {
        if (tasks.length > 0) {
            fetchUserTasks();
        }
    }, [tasks]);

    useEffect(() => {
        // Cleanup function to clear the interval on unmount
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [intervalId]);

    if (loadingTasks || loadingStatus) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className='w-full bg-gray-100 p-4'>
           <div className="text-center bg-blue-200 p-10 ">
                <h1 className="text-3xl font-bold text-gray-800">
                    Task Management
                </h1>
            </div>
            <div className='w-full flex flex-col sm:flex-row py-5 justify-end items-center  rounded-md shadow-md'>
                <div>
                    <input
                        type="search"
                        placeholder="Search Task"
                        value={searchTerm}
                        onChange={searchHandler}
                        className='border border-gray-500 px-10 py-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto'
                    />
                </div>
            </div>

            <div className="overflow-x-auto ">
                <table className='min-w-full bg-white shadow-md rounded'>
                    <thead className='bg-pink-500'>
                        <tr className="text-center text-white">
                            <th className="p-4" scope="col">Task Name</th>
                            <th className="p-4" scope="col">Owner</th>
                            <th className="p-4" scope="col">Start Date</th>
                            <th className="p-4" scope="col">End Date</th>
                            <th className="p-4" scope="col">Task Status</th>
                            <th className="p-4" scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userTasks.map((item) => (
                            <tr key={item._id}>
                                <td className="p-4 text-center">{item.taskname}</td>
                                <td className="p-4 text-center">{item.owner ? (typeof item.owner === 'object' ? item.owner.username : item.owner) : 'No Owner'}</td>
                                <td className="p-4 text-center">{new Date(item.startdate).toLocaleDateString()}</td>
                                <td className="p-4 text-center">{new Date(item.enddate).toLocaleDateString()}</td>
                                <td className="p-4 text-center">
                                    <select
                                        value={item.taskstatus}
                                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                        className="border border-gray-400 p-2 rounded-md"
                                    >
                                        {taskStatus.map((status, index) => (
                                            <option key={index} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className='p-4 text-center'>
                                    <Link to={`/manualtimelog/${item._id}`}>
                                        <button className="bg-green-500 text-white px-4 py-2 mx-2 w-[100px] rounded-md mr-2 hover:bg-green-600 transition">
                                            LogTime
                                        </button>
                                    </Link>
                                    <button className="text-black px-4 py-2 mx-2 rounded-md transition" onClick={() => taskAction(item._id)}>
                                        {activeTaskId === item._id ? <FaStop style={{ color: 'green' }} /> : <FaPlay style={{ color: 'red' }} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserDashboard;
