import React, { useEffect, useState } from 'react';
import './tailwind.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initial_time_values = {
    time: "",
    description: ""
};

const ManualTimeLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [logvalues, setLogValues] = useState(initial_time_values);

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setLogValues({ ...logvalues, [name]: value });
        console.log("logvalues==", logvalues);
    };

    const changeMinsToHrs = (min) => {
        const hrs = Math.floor(min / 60);
        const mins = min - (hrs * 60);
        const format_hrs = String(hrs).padStart(2, '0');
        const format_mins = String(mins).padStart(2, '0');
        return `${format_hrs}:${format_mins}:00`;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (isNaN(logvalues.time) || logvalues.time.trim() === "") {
            alert("Please enter a valid number for time in minutes.");
            return;
        }

        logvalues.time = changeMinsToHrs(parseInt(logvalues.time));
        console.log("logvalues==", logvalues);

        try {
            const data = await axios.post(`http://localhost:8000/tasks/logtime/${id}`, logvalues);
            console.log("data==", data);
            toast.success("Time logged successfully");
            setTimeout(()=>{  navigate("/tasks");},2000)
           
        } catch (error) {
            console.error("Error logging time:", error);
        }
    };

    useEffect(() => {
        console.log("Task ID:", id);
    }, [id]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ToastContainer position="top-center" autoClose={2000}/>
        <form className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-lg shadow-lg" onSubmit={submitHandler}>
            <h2 className="text-3xl font-semibold text-red-500 mb-6">Manual Time Log</h2>
    
            <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-2">Enter Time in Minutes</label>
                <input
                    type="text"
                    placeholder="Enter Time In Minutes"
                    onChange={changeHandler}
                    name="time"
                    value={logvalues.time}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300"
                />
            </div>
    
            <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-2">Enter Description</label>
                <textarea
                    placeholder="Enter Description"
                    onChange={changeHandler}
                    name="description"
                    value={logvalues.description}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300"
                    rows="4"
                ></textarea>
            </div>
    
            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
                Log Time
            </button>
        </form>
    </div>
    
    );
};

export default ManualTimeLog;
