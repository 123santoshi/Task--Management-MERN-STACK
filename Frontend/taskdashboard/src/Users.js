import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "./tailwind.css";
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [showImportExportOption, setImportExportOption] = useState(false);
  const [showActiveUsers, setShowActiveUsers] = useState(true);

  const getUsers = async () => {
    try {
      const endpoint = showActiveUsers ? "activeusers" : "inactiveusers";
      const { data } = await axios.get(`http://localhost:8000/users/${endpoint}`);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data || "Error fetching users");
    }
  };

  const activateUser = async (id) => {
    if (window.confirm("Do you want to activate the user?")) {
      try {
        const res = await axios.put(`http://localhost:8000/users/activateuser/${id}`);
        toast.success(res.data.message);
        getUsers();
      } catch (error) {
        console.error("Error activating user:", error);
        toast.error("An error occurred while activating the user.");
      }
    }
  };
  const inActivateUser = async (id) => {
    if (window.confirm("Do you want to inactivate the user?")) {
      try {
        const res = await axios.put(`http://localhost:8000/users/inactive/${id}`);
        toast.success(res.data.message);
        getUsers();
      } catch (error) {
        console.error("Error inactivating user:", error);
        toast.error("An error occurred while inactivating the user.");
      }
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
    if (users.length === 0) {
      toast.error("No users available to download.");
      return;
    }

    const headers = ["UserId", "Username", "Email", "Role"];
    const rows = users.map(user => [
      user._id,
      user.username,
      user.email,
      user.role,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Users_List.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleCSV = () => {
    const headers = ["username", "email", "role"];
    const rows = [
      ["exampleUser", "example@mail.com", "Admin"],
      ["sampleUser", "sample@mail.com", "User"],
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Sample_Users_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadExcel = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      try {
        const res = await axios.post('http://localhost:8000/users/bulk-upload', jsonData);
        toast.success(res.data.message);
        getUsers(); // Refresh user list
      } catch (error) {
        console.error('Error uploading users:', error);
        toast.error(error.response.data);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadExcel(file);
    }
  };

  useEffect(() => {
    getUsers();
  }, [showActiveUsers]);

  const filteredUsers = users.filter(user => {
    const searchLower = searchUser.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className='w-full bg-gray-100 p-4'>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className='w-full flex flex-col sm:flex-row justify-between items-center p-5 rounded-md shadow-md'>
        <div className='mb-4 sm:mb-0'>
          <Link to="/adduser">
            <button className="border text-lg font-bold border-black text-black px-10 py-3 rounded-md hover:bg-green-400 transition">
              Add User
            </button>
          </Link>
          
          <div className="relative inline-block text-left mx-5">
            <button 
              className="border text-lg font-bold border-black text-black px-10 py-3 rounded-md focus:outline-none" 
              onClick={() => setImportExportOption(!showImportExportOption)}
            >
              Add Multiple Users
            </button>
            {showImportExportOption && (
              <div className="absolute right-0 mt-2 w-full bg-white border rounded-md shadow-lg">
                <button
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 text-lg"
                  onClick={downloadSampleCSV}
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
            )}
          </div>

          <div className="relative inline-block text-left ">
            <button 
              className="border text-lg font-bold border-black text-black px-10 py-3 rounded-md focus:outline-none" 
              onClick={() => setShowActiveUsers(!showActiveUsers)}
            >
              {showActiveUsers ? "Active Users" : "Inactive Users"}
            </button>
          </div>
        </div>

        <div className='mb-4 sm:mb-0'>
          <h3 className='text-red-600 font-bold text-lg'>Total No Of Users: {users.length}</h3>
        </div>

        <div>
          <input
            type="search"
            placeholder="Search user"
            onChange={searchHandler}
            className='border border-gray-500 px-10 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto'
          />
          <button className="border border-gray-500 px-10 py-3 mx-3 rounded-md focus:outline-none" onClick={downloadCSV}>
            <h1 className="font-bold">Download Users  <i className="fas fa-download"></i></h1>
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
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className='text-center'>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-200">
                  <td className="p-4">{user._id}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4 text-center">
                    {showActiveUsers ?
                    <>
                      <Link to={`/edituser/${user._id}`}>
                      <button className="bg-blue-500 text-white px-4 py-2 w-[50px] rounded-md mr-2 hover:bg-blue-600 transition">
                        <i className="fas fa-edit"></i>
                      </button>
                    </Link>
                    <button className="bg-red-500 text-white w-[50px] px-4 py-2 rounded-md hover:bg-red-600 transition" onClick={() => inActivateUser(user._id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                    <button className="text-white bg-green-500 w-[50px] px-4 py-2  mx-2 rounded-md hover:bg-green-600 transition" onClick={() => sendInvite(user._id)}>
                      <i className="fas fa-paper-plane"></i>
                    </button>
                    </>:
                    <>
                    <button className="bg-blue-500 text-white px-4 py-2 w-[50px] rounded-md mr-2 hover:bg-blue-600 transition"
                    onClick={() => activateUser(user._id)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    <button className="bg-red-500 text-white w-[50px] px-4 py-2 rounded-md hover:bg-red-600 transition" onClick={() => deleteUser(user._id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                    </>
                    }  
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
