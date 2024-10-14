import React, { useEffect, useState } from 'react';
import './tailwind.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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
            alert("Time logged successfully");
            navigate("/tasks");
        } catch (error) {
            console.error("Error logging time:", error);
        }
    };

    useEffect(() => {
        console.log("Task ID:", id);
    }, [id]);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form className="w-full max-w-lg p-6 bg-white border border-gray-300 rounded-lg shadow-md" onSubmit={submitHandler}>
                <h2 className="text-2xl font-bold text-red-500 mb-5">Manual Time Log</h2>
                <div className="mb-5">
                    <label className="block text-lg font-bold text-left text-gray-700 my-2">Enter Time in Minutes</label>
                    <input
                        type="text"
                        placeholder="Enter Time In Minutes"
                        onChange={changeHandler}
                        name="time"
                        value={logvalues.time}
                        className="mt-1 block w-full p-4 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                <div className="mb-5">
                    <label className="block text-lg font-bold text-left text-gray-700">Enter Description</label>
                    <textarea
                        placeholder="Enter Description"
                        onChange={changeHandler}
                        name="description"
                        value={logvalues.description}
                        className="mt-1 block w-full p-4 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    ></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 transition">
                    Log Time
                </button>
            </form>
        </div>
    );
};

export default ManualTimeLog;
