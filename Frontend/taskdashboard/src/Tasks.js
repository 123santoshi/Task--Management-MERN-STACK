import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "./tailwind.css";
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaStop } from 'react-icons/fa'; 

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [taskstatus, setTaskStatus] = useState([]);
    const [time, setTime] = useState(0);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const navigate = useNavigate();

    const getTasks = async () => {
        const data = (await axios.get("http://localhost:8000/tasks")).data;
        setTasks(data);
    };

    const getTaskStatus = async () => {
        const data = (await axios.get("http://localhost:8000/tasks/taskstatus")).data;
        setTaskStatus(data.taskstatus);
    };

    const deleteTask = async (id) => {
        if (window.confirm("Do you want to delete the Task?")) {
            try {
                const response = await axios.delete(`http://localhost:8000/tasks/${id}`);
                alert(response.data.message);
                getTasks();
            } catch (err) {
                console.error("Error while deleting the task:", err);
                alert("Error while deleting the task");
            }
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
                prevTasks.map((task) =>
                    task._id === updatedTask._id ? updatedTask : task
                )
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const timeLog = async (id) => {
        const logtime = convertSecToHrs(time);
        console.log("logtime==", logtime);
        try {
            const res = await axios.post(`http://localhost:8000/tasks/logtime/${id}`, { time: logtime });
            console.log("res from logtime API==", res);
        } catch (error) {
            console.error("Error logging time:", error);
        }
    };

    // Function to convert seconds to HH:MM format
    const convertSecToHrs = (sec) => {
        const mins = Math.floor(sec / 60); // Total minutes
        const hrs = Math.floor(mins / 60); // Total hours
        const remainingMins = mins % 60; // Remaining minutes
        const remainingSecs = sec % 60; // Remaining seconds
        const hrsStr = String(hrs).padStart(2, '0');
        const minsStr = String(remainingMins).padStart(2, '0');
        const secsStr = String(remainingSecs).padStart(2, '0');
    
        return `${hrsStr}:${minsStr}:${secsStr}`; 
    };
    

    // Function to handle starting and stopping the task
    const taskAction = (id) => {
        if (activeTaskId === id) {
            clearInterval(intervalId);
            setIntervalId(null);
            timeLog(id); // Log time when stopping the task
            setActiveTaskId(null); // Reset the active task ID
            setTime(0); // Reset time after logging
        } else {
            // Start the new task
            if (intervalId) clearInterval(intervalId); // Clear the previous task's interval
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

    return (
        <div className='w-full bg-gray-100 p-4'>
            <div className='w-full flex flex-col sm:flex-row justify-between items-center p-5 rounded-md shadow-md'>
                <div className='mb-4 sm:mb-0'>
                    <Link to="/addtask">
                        <button className="border text-lg font-bold border-black text-black px-10 py-3 rounded-md hover:bg-green-600 transition">
                            Add Task
                        </button>
                    </Link>
                </div>
                <div className='mb-4 sm:mb-0'>
                    <h3 className='text-red-600 font-bold text-lg'>Total No Of Tasks: {tasks.length}</h3>
                </div>
                <div>
                    <input
                        type="search"
                        placeholder="Search Task"
                        value={searchTerm}
                        onChange={searchHandler}
                        className='border border-gray-500 px-10 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto'
                    />
                </div>
            </div>

            <div className="overflow-x-auto mt-5">
                <table className='min-w-full bg-white shadow-md rounded'>
                    <thead className='bg-pink-500'>
                        <tr className="text-center text-white">
                            <th className="p-4">Task Name</th>
                            <th className="p-4">Owner</th>
                            <th className="p-4">Start Date</th>
                            <th className="p-4">End Date</th>
                            <th className="p-4">Task Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map((item) => (
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
                                        {taskstatus.map((status, index) => (
                                            <option key={index} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className='p-4 text-center'>
                                    <Link to={`/edittask/${item._id}`}>
                                        <button className="bg-blue-500 text-white px-4 py-2 w-[100px] rounded-md mr-2 hover:bg-blue-600 transition">
                                            Edit
                                        </button>
                                    </Link>
                                    <button className="bg-red-500 text-white w-[100px] px-4 py-2 rounded-md hover:bg-red-600 transition" onClick={() => deleteTask(item._id)}>
                                        Delete
                                    </button>
                                    <Link to={`/manualtimelog/${item._id}`}>
                                        <button className="bg-green-500 text-white px-4 py-2 mx-2 w-[100px] rounded-md mr-2 hover:bg-green-600 transition">
                                            LogTime
                                        </button>
                                    </Link>
                                    <button className="text-black px-4 py-2 mx-2 rounded-md transition" onClick={() => taskAction(item._id)}>
                                        {activeTaskId === item._id ? <FaStop style={{color:'green'}}/> : <FaPlay style={{ color: 'red' }} />
                                    }
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

export default Tasks;
