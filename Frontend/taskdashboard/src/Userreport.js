import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';

const Userreport = () => {
    const [tasks, setTasks] = useState([]);
    const [loggedTime, setLoggedTime] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const username = localStorage.getItem('username');
    console.log("username==", username);

    const getTasks = async () => {
        try {
            const { data } = await axios.get("http://localhost:8000/tasks");
            setTasks(data);
            console.log("tasks==", data);
            const userTasks = data.filter((item) => item.owner.username === username);
            console.log("usertasks==", userTasks);
            const filteredTime = userTasks.flatMap((item) =>
                item.spent_time.map((timeEntry) => ({
                    ...timeEntry,
                    taskName: item.taskname, 
                }))
            );

            setLoggedTime(filteredTime);
            console.log("Logged time==", filteredTime);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        getTasks();
    }, []);

    const addOneDay = (date) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
      };

    const filteredLoggedTime = loggedTime.filter(item => {
        const logDate = new Date(item.logdate).toISOString().split('T')[0]; 
        const startISO = startDate ? addOneDay(startDate).toISOString().split('T')[0]:null
        const endISO = endDate ? addOneDay(endDate).toISOString().split('T')[0]:null
    
        console.log("startISO==", startISO);
        console.log("endISO==", endISO);
        console.log("logDate==", logDate);
    
        return (
            (!startISO || logDate >= startISO) && 
            (!endISO || logDate <= endISO)
        );
    });
    

    return (
        <div className='flex flex-col min-h-screen  bg-gray-200 p-6'>
            <div className="bg-blue-200 p-10">
            <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Task Management
                    </h1>
                    <div className='flex flex-row  items-center mx-10 '>
                        <ul className="list-none">
                            <Link to="/userdashboard"><li className="text-2xl mx-10 font-bold text-gray-800">Tasks</li></Link>
                        </ul>
                        <ul className="list-none">
                            <Link to="/userreport"><li className="text-2xl mx-10 font-bold text-gray-800">Logtime</li></Link>
                        </ul>
                    </div>

                </div>
            </div>
            <br/>
            <div className='flex space-x-4 mb-4'>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                    className="border border-gray-300 rounded-lg p-4 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="End Date"
                    className="border border-gray-300 rounded-lg p-4 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                />
            </div>
            <div className='overflow-x-auto w-full'>
                <table className='min-w-full bg-white shadow-lg rounded-lg'>
                    <thead className='bg-pink-400 text-white'>
                        <tr>
                            <th className='py-2 px-4 text-left text-xl'>Task Name</th> 
                            <th className='py-2 px-4 text-left'>Logged Time</th>
                            <th className='py-2 px-4 text-left'>Description</th>
                            <th className='py-2 px-4 text-left'>Logged Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoggedTime.map((item, index) => (
                            <tr key={index} className='hover:bg-gray-100'>
                                <td className='py-2 px-4'>{item.taskName}</td> 
                                <td className='py-2 px-4'>{item.time}</td>
                                <td className='py-2 px-4'>{item.description}</td>
                                <td className='py-2 px-4'>{item.logdate.split('T')[0]}</td>
                            </tr>
                        ))}
                        {filteredLoggedTime.length === 0 && (
                            <tr>
                                <td colSpan="4" className='py-2 px-4 text-center text-gray-500'>No logged time found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Userreport;
