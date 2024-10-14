import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const initialTaskValues = {
  taskname: '',
  owner: '',
  startdate: new Date().toISOString().split('T')[0],
  enddate: '',
  taskstatus: '',
};

const AddEditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskValues, setTaskValues] = useState(initialTaskValues);
  const [userNames, setUserNames] = useState([]);

  const getUserNames = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/users');
      setUserNames(data);
    } catch (error) {
      console.error('Error fetching user names', error);
    }
  };

  const getTaskByID = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:8000/tasks/${id}`);
      console.log("data==", data);
      setTaskValues({
        ...taskValues,
        taskname: data.taskname,
        owner: data.owner._id,
        startdate: data.startdate.split('T')[0],
        enddate: data.enddate.split('T')[0],
        taskstatus: data.taskstatus,
      });
    } catch (error) {
      console.error('Error fetching task by ID', error);
    }
  };
  

  useEffect(() => {
    if (id) {
      getTaskByID(id);
    }
    getUserNames();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskValues({
      ...taskValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:8000/tasks/${id}`, taskValues);
        alert("Task Updated Successfully");
      } else {
        await axios.post('http://localhost:8000/tasks', taskValues);
        alert("Task Added Successfully");
      }
      navigate("/tasks");
    } catch (error) {
      console.error('Error submitting the task', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full m-auto p-6 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-lg font-bold text-gray-700">Task Name</label>
            <input
              type="text"
              placeholder="Enter Task Name"
              name="taskname"
              value={taskValues.taskname}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700">Task Owner</label>
            <select
              name="owner"
              value={taskValues.owner}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Owner</option>
              {userNames.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700">Start Date</label>
            <input
              type="date"
              name="startdate"
              value={taskValues.startdate}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700">End Date</label>
            <input
              type="date"
              name="enddate"
              value={taskValues.enddate}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700">Task Status</label>
            <select
              name="taskstatus"
              value={taskValues.taskstatus}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Task Status</option>
              <option value="New">New</option>
              <option value="Not started">Not started</option>
              <option value="Inprogress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full p-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {id ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditTask;
