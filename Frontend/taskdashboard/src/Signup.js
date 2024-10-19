import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./tailwind.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const Signup = () => {
  const initialDetails = {
    username: '',
    email: '',
    role: 'admin'
  };

  const navigate = useNavigate();
  const [user, setUser] = useState(initialDetails);
  const [error, setError] = useState(null); 


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
    console.log("user==",user)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/users/signup", user);
      console.log("response==",response);
      if (response.status === 201) { 
        toast.success("User Created Successfully");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response ? err.response.data.message : "Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-center" autoClose={2000}/>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg rounded-lg px-8 py-6">
      <h1 className="text-2xl font-bold text-red-700 text-center mb-6">Signup</h1>

       

        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Enter username" 
            name="username" 
            value={user.username} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-4  border-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <input 
            type="email" 
            placeholder="Enter Email" 
            name="email" 
            value={user.email} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-4 border border-black  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Enter Role" 
            name="role" 
            value={user.role} 
            onChange={handleChange} 
            disabled
            className="w-full px-4 py-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white font-semibold py-4 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Signup
        </button>
        <br/><br/>
        {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error message */}

        <h3 className='text-red-500 font-35 font-bold '>Already have an account ? Click here to <Link to ="/login">Signin</Link></h3>

      </form>
    </div>
  );
};

export default Signup;
