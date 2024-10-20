import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "./tailwind.css";
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaStop } from 'react-icons/fa'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';


const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [taskstatus, setTaskStatus] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [showimportexportoption,setImportExportOption]=useState(false);
    const [time, setTime] = useState(0);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
   

    const getTasks = async () => {
        const data = (await axios.get("http://localhost:8000/tasks")).data;
        setTasks(data);
        console.log("tasks==", data);
    };

    const getTaskStatus = async () => {
        const data = (await axios.get("http://localhost:8000/tasks/taskstatus")).data;
        setTaskStatus(data.TaskStatus);
    };

    const getPriorities = async () => {
        const data = (await axios.get("http://localhost:8000/tasks/priorities")).data;
        console.log("priorities==",data);
        setPriorities(data.Priority);
    };

    const deleteTask = async (id) => {
        if (window.confirm("Do you want to delete the Task?")) {
            try {
                const response = await axios.delete(`http://localhost:8000/tasks/${id}`);
                toast.success(response.data.message);
                getTasks();
            } catch (err) {
                console.error("Error while deleting the task:", err);
                toast.error("Error while deleting the task");
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
            console.log("username==", username);
            const response = await axios.put(`http://localhost:8000/tasks/${id}`, { taskstatus: newStatus, username: username });
            const updatedTask = response.data;
            console.log("updated task==", updatedTask);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === updatedTask._id ? updatedTask : task
                )
            );
            console.log("after updated the task status==", tasks);
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handlePriorityChange = async (id, newPriority) => {
        try {
            console.log("username==", username);
            const response = await axios.put(`http://localhost:8000/tasks/${id}`, { taskpriority: newPriority, username: username });
            const updatedTask = response.data;
            console.log("updated task==", updatedTask);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === updatedTask._id ? updatedTask : task
                )
            );
            console.log("after updated the task priority==", tasks);
        } catch (error) {
            console.error('Error updating task priority:', error);
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

    const sortTasks = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setTasks(sortedTasks);
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
            if (intervalId) clearInterval(intervalId); 
            setTime(0);
            setActiveTaskId(id);
            const newIntervalId = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
            setIntervalId(newIntervalId);
        }
    };

    const handleFilterChange = (filter) => {
        if (filter === "active") {
            const activeTasks = tasks.filter(task => task.taskstatus !== 'Completed');
            setTasks(activeTasks); 
        } else {
            getTasks(); 
        }
    };
    

    const downloadCSV = () => {
        const headers = ["Task Name", "Owner", "Start Date", "End Date", "Recurring Task", 'Task Status','Task Priority'];
        const rows = filteredTasks.map(task => [
            task.taskname,
            task.owner.username,
            task.startdate,
            task.enddate,
            task.isrecurring,
            task.taskstatus,
            task.taskpriority,
        ]);
        let csvContent = "data:text/csv;charset=utf-8,"
          + headers.join(",") + "\n"
          + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "Tasks_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };




// Function to download a sample CSV file
    const downloadTaskSampleCSV = () => {
        const headers = ["taskname", "owner", "startdate", "enddate", "isrecurring", 'taskstatus', 'taskpriority'];
        const rows = [
            ["Example Task", "santoshi", "2024-10-01", "2024-10-10", "false", "New", "High"],
            ["Sample Task", "chinni", "2024-10-11", "2024-10-20", "true", "InProgress", "Medium"],
        ];
        
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "Sample_Tasks_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

// Function to upload an Excel file
        const uploadExcel = (file) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                console.log("Parsed JSON Data:", jsonData);
                try {
                    const res = await axios.post('http://localhost:8000/tasks/bulktasks-upload', jsonData);
                    console.log("Response from server:", res);
                    toast.success(res.data.message);
                    getTasks(); // Refresh user list
                } catch (error) {
                    console.error('Error uploading tasks:', error);
                    toast.error("An error occurred while uploading users.");
                }
            };

            reader.onerror = (error) => {
                console.error("File reading error:", error);
                toast.error("An error occurred while reading the file.");
            };

            reader.readAsArrayBuffer(file);
        };

        // Handler for file input change
        const handleFileChange = (event) => {
            console.log("ee==",event);
            const file = event.target.files[0];
            if (file) {
                
                uploadExcel(file);
            }
        };


    useEffect(() => {
        getTasks();
        getTaskStatus();
        getPriorities()
;    }, [showimportexportoption]);

    return (
        <div className='w-full bg-gray-100 p-4'>
              <ToastContainer position="top-center" autoClose={2000}/>
            <div className='w-full flex flex-col sm:flex-row justify-between items-center p-5 rounded-md shadow-md'>
                <div className='mb-4 sm:mb-0'>
                    <Link to="/addtask">
                        <button className="border text-lg font-bold border-black text-black px-10 py-3 rounded-md hover:bg-green-600 transition">
                            Add Task
                        </button>
                    </Link>
                    <select className="border text-lg font-bold border-black text-black px-10 py-3.5 mx-2 rounded-md  transition"
                            onChange={(e) => handleFilterChange(e.target.value)} >
                            <option value="all" className='text-blue-500'>All Tasks</option>
                            <option value="active" className='text-blue-500'>Active Tasks</option>
                    </select>
                    

                    <div className="relative inline-block text-left ">
                        <button className="border text-lg font-bold border-black text-black px-10 py-3 rounded-md  focus:outline-none" onClick={()=>setImportExportOption(!showimportexportoption)}>
                        Add Multiple Tasks
                        </button>
                        { showimportexportoption &&
                            <div className="absolute right-0 mt-2 w-full bg-white border rounded-md shadow-lg ">
                            <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 text-lg"
                            onClick={downloadTaskSampleCSV}
                            >
                            Export Sample Data
                            </button>
                            <label className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 cursor-pointer text-lg">
                            Import Data
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            </label>
                        </div>
                        }
                    </div>
                                
                </div>
                
                <div className='mb-4 sm:mb-0'>
                    <h3 className='text-red-600 font-bold text-lg'>Total No Of Tasks : {tasks.length}</h3>
                </div>

               

                <div>
                    <input
                        type="search"
                        placeholder="Search Task"
                        value={searchTerm}
                        onChange={searchHandler}
                        className='border border-gray-500 px-10 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto'
                    />

                    <button className= "border border-gray-500 px-10 py-3 mx-3 rounded-md focus:outline-none"onClick={downloadCSV}>
                        <h1>Download Tasks <i className="fas fa-download"></i></h1>
                    </button>  
                </div>
            </div>

            <div className="overflow-x-auto mt-5">
                <table className='min-w-full bg-white shadow-md rounded'>
                <thead className='bg-pink-500'>
                        <tr className="text-center text-white">
                            <th className="p-4 cursor-pointer" onClick={() => sortTasks('taskname')}>
                                Task Name {sortConfig.key === 'taskname' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="p-4 cursor-pointer" onClick={() => sortTasks('owner.username')}>
                                Owner {sortConfig.key === 'owner.username' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="p-4 cursor-pointer" onClick={() => sortTasks('startdate')}>
                                Start Date {sortConfig.key === 'startdate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="p-4 cursor-pointer" onClick={() => sortTasks('enddate')}>
                                End Date {sortConfig.key === 'enddate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="p-4">Recurring Task</th>
                            <th className="p-4 cursor-pointer" onClick={() => sortTasks('taskpriority')}>
                                Task Priority {sortConfig.key === 'taskpriority' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th className="p-4 cursor-pointer" onClick={() => sortTasks('taskstatus')}>
                                Task Status {sortConfig.key === 'taskstatus' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
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
                                <td className="p-4 text-center">{item.isrecurring ? 'True' : 'False'}</td>

                                <td className="p-4 text-center">
                                    <select
                                        value={item.taskpriority}
                                        onChange={(e) => handlePriorityChange(item._id, e.target.value)}
                                        className={`border border-gray-400 p-3 rounded-md ${
                                        item.taskpriority === "Critical" ? "bg-red-600 text-white" :
                                        item.taskpriority === "High" ? "bg-orange-500 text-white" :
                                        item.taskpriority === "Medium" ? "bg-yellow-300 text-black" :
                                        item.taskpriority === "Low" ? "bg-green-500 text-black" : "bg-red-600"
                                        }`}
                                    >
                                        {priorities.map((p, index) => (
                                        <option
                                            key={index}
                                            value={p}
                                            className="bg-white text-black " 
                                        >
                                            {p}
                                        </option>
                                        ))}
                                    </select>
                                    </td>



                                <td className="p-4 text-center">
                                    <select
                                        value={item.taskstatus}
                                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                        className="border border-gray-400 p-2 rounded-md"
                                    >
                                        {taskstatus.map((status, index) => (
                                            <option key={index} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="p-4 text-center">
                                    <Link to={`/edittask/${item._id}`}>
                                            <button className="bg-blue-500 text-white px-4 py-2 w-[50px] rounded-md mr-2 hover:bg-blue-600 transition">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </Link>
                                        <button className="bg-red-500 text-white w-[50px] px-4 py-2 rounded-md hover:bg-red-600 transition" onClick={() => deleteTask(item._id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <Link to={`/manualtimelog/${item._id}`}>
                                            <button className="bg-green-500 text-white px-4 py-2 mx-2 w-[50px] rounded-md mr-2 hover:bg-green-600 transition">
                                                <i className="fas fa-clock"></i>
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
