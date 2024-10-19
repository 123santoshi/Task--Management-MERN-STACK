import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "./tailwind.css";
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  const getUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/users');
      console.log('get users==', res.data);
      setUsers(res.data); // Set the fetched users in the state
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };



const deleteUser = async (id) => {
    if (window.confirm("Do you want to delete the user?")) {
        try {
            const res = await axios.delete(`http://localhost:8000/users/${id}`);
            toast.success(res.data.message);
            getUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("An error occurred while deleting the user.");
        }
    }
};

const sendInvite = async (id) => {
    try {
        const res = await axios.get(`http://localhost:8000/users/invite/${id}`);
        toast.success(res.data.message);
    } catch (err) {
        console.error("Error sending invite:", err);
        toast.error("An error occurred while sending the invite.");
    }
};


  const searchHandler = (e) => {
    setSearchUser(e.target.value);
  };


  const downloadCSV = () => {
    const headers = ["Username" ,"Email", "Role"];
    const rows = filteredUsers.map(user => [
        user.username,
        user.email,
        user.role
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Users_List.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

};
  
  


  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    return (
      (user.username && user.username.toLowerCase().includes(searchUser.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchUser.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchUser.toLowerCase()))
    );
  });
  


  return (
    <div className='w-full bg-gray-100 p-4'>
      <ToastContainer position="top-center" autoClose={2000}/>
      <div className='w-full flex flex-col sm:flex-row justify-between items-center p-5 rounded-md shadow-md'>
        <div className='mb-4 sm:mb-0'>
          <Link to="/adduser">
            <button className="border text-lg font-bold border-black text-black px-10 py-3 rounded-md hover:bg-green-600 transition">
              Add User
            </button>
          </Link>
        </div>
        <div className='mb-4 sm:mb-0'>
          <h3 className='text-red-600 font-bold text-lg'>Total No Of Users : {users.length}</h3>
        </div>
        <div>
          <input
            type="search"
            placeholder="Search user"
            onChange={searchHandler}
            className='border border-gray-500 px-10 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto'
          />

         <button className= "mx-5 text-2xl" onClick={downloadCSV}>
              <i className="fas fa-download"></i>
          </button>   
        </div>
      </div>

      <div className="overflow-x-auto mt-5">
        <table className='min-w-full bg-white shadow-md rounded'>
          <thead className='bg-pink-500'>
            <tr className="text-center text-white">
            <th className="p-4">UserId</th>
              <th className="p-4">User Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-100">
                  <td className="p-4 text-center">{item._id}</td>
                  <td className="p-4 text-center">{item.username}</td>
                  <td className="p-4 text-center">{item.email}</td>
                  <td className="p-4 text-center">{item.role}</td>
                  <td className="p-4 text-center">
                    <Link to={`/edituser/${item._id}`}>
                      <button className="bg-blue-500 text-white px-4 py-2 w-[50px] rounded-md mr-2 hover:bg-blue-600 transition">
                        <i className="fas fa-edit"></i>
                      </button>
                    </Link>
                    <button className="bg-red-500 text-white w-[50px] px-4 py-2 rounded-md hover:bg-red-600 transition" onClick={() => deleteUser(item._id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                    <button className=" text-white mx-2  px-4 py-2 rounded-md hover: bg-green-500 transition" onClick={()=>sendInvite(item._id)}>
                    <i className="fas fa-paper-plane"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
