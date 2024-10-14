import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
      alert('Error fetching user details');
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
        alert('User updated successfully');
      } else {
        await axios.post('http://localhost:8000/users/signup', userData);
        alert('User added successfully');
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg rounded-lg px-8 py-6">
        {loading ? (
          <div className="text-center mb-5">Loading user data...</div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter UserName"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 mb-5 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Enter Email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="w-full px-4 py-4 mb-5 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="w-full px-4 py-4 mb-5 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Select Role</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>

            <button
              type="submit"
              className={`w-full p-4 font-bold text-lg rounded text-white ${id ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
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
