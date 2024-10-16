import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const initialTaskValues = {
  taskname: '',
  owner: '',
  startdate: new Date().toISOString().split('T')[0],
  enddate: '',
  taskstatus: '',
  isrecurring: false, 
  recuringfrequency: '',
  recuringenddate: ''
};

const AddEditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskValues, setTaskValues] = useState(initialTaskValues);
  const [userNames, setUserNames] = useState([]);
  const [isTaskRecurring, setTaskRecurring] = useState(false);

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
        taskname: data.taskname,
        owner: data.owner._id|| '',  
        startdate: data.startdate ? data.startdate.split('T')[0] : '',  
        enddate: data.enddate ? data.enddate.split('T')[0] : '',  
        taskstatus: data.taskstatus,
        isrecurring: data.isrecurring,
        recuringfrequency: data.recuringfrequency || '',
        recuringenddate: data.recuringenddate ? data.recuringenddate.split('T')[0] : '' 
      });
      

      console.log("task values===",taskValues);
      setTaskRecurring(data.isrecurring);
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

    if (name === 'isrecurring') {
      const isrecurring = value === 'true';
      setTaskValues({ ...taskValues, isrecurring: isrecurring });
      setTaskRecurring(isrecurring);
    } else {
      setTaskValues({
        ...taskValues,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        console.log("taksvalues to update==",taskValues);
        await axios.put(`http://localhost:8000/tasks/${id}`, taskValues);
        alert("Task Updated Successfully");
        console.log("taksvalues after update==",taskValues);

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
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700">Task Owner</label>
            <select
              name="owner"
              value={taskValues.owner}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
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
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
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
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700">Task Status</label>
            <select
              name="taskstatus"
              value={taskValues.taskstatus}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
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
            <label className="block text-lg font-bold text-gray-700">Is Recurring</label>
            <select
              name="isrecurring"
              value={taskValues.isrecurring ? 'true' : 'false'}
              onChange={handleInputChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {isTaskRecurring && (
            <>
              <div>
                <label className="block text-lg font-bold text-gray-700">Recurring Frequency</label>
                <select
                  name="recuringfrequency"
                  value={taskValues.recuringfrequency}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Select Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700">Recurring End Date</label>
                <input
                  type="date"
                  name="recuringenddate"
                  value={taskValues.recuringenddate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              className="w-full p-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700"
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
