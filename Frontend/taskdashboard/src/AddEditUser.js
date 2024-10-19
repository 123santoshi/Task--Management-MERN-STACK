import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialValues = {
  username: "",
  email: "",
  role: ""
};

const AddEditUser = () => {
  const { id } = useParams(); // Extract id from route params
  const [userData, setUserData] = useState(initialValues);
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false);

  const getUserDataById = async (id) => {
    try {
      setLoading(true);  // Show loading while fetching data
      const { data } = await axios.get(`http://localhost:8000/users/${id}`);
      console.log(data);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Error fetching user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getUserDataById(id);
      
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:8000/users/${id}`, userData);
        toast.success('User updated successfully');
      } else {
        await axios.post('http://localhost:8000/users/signup', userData);
        toast.success('User added successfully');
      }
      setTimeout(() => {
        navigate('/users');
    }, 2000);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error saving user');
    }
  };

  return (
    
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <ToastContainer position="top-center" autoClose={3000}/>
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        {loading ? (
            <div className="text-center mb-5 text-gray-600">Loading user data...</div>
        ) : (
            <>
                <div className="mb-5">
                    <label className="block text-xl  font-bold text-gray-700 mb-3" htmlFor="username">User Name <span className='text-red-400'>*</span></label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Enter User Name"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    />
                </div>

                <div className="mb-5">
                    <label className="block text-xl font-bold text-gray-700 mb-3" htmlFor="email">Email  <span className='text-red-400'>*</span></label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter Email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    />
                </div>

                <div className="mb-5">
                    <label className="block text-xl font-bold text-gray-700 mb-3" htmlFor="role">Role  <span className='text-red-400'>*</span></label>
                    <select
                        id="role"
                        name="role"
                        value={userData.role}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    >
                        <option value="" disabled>Select Role</option>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className={`w-full py-4 font-bold text-lg rounded-lg text-white ${id ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${id ? 'red-500' : 'green-500'} transition duration-300`}
                >
                    {id ? 'Update User' : 'Add User'}
                </button>
            </>
        )}
      </form>
  </div>

    );
};

export default AddEditUser;
