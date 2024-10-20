import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./tailwind.css";

const History = () => {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]); // State to store users

  const getTasks = async () => {
    try {
      const response = await axios.get("http://localhost:8000/tasks");
      setTasks(response.data);
      console.log("tasks==", response.data);

      const allHistory = response.data.flatMap((task) => 
        (task.history || []).map(change => ({
          ...change,
          taskname: task.taskname,
          ownerId: task.owner._id, // Store owner ID for reference
          ownerName: task.owner.username // Store owner name for reference
        }))
      );

      console.log("allHistory==", allHistory);

      const sortedHistory = allHistory.sort((a, b) =>
        new Date(b.changedAt || b.changedat) - new Date(a.changedAt || a.changedat)
      );

      setHistory(sortedHistory);
      console.log("history==", sortedHistory);

      // Fetch users data
      const usersResponse = await axios.get("http://localhost:8000/users"); // Adjust this URL as needed
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div className="p-4">
      <table className="min-w-full m-auto bg-white border border-black-300 ">
        <thead>
          <tr className="bg-blue-100 p-5 border">
            <th className="p-4 border-b text-center text-black-600 font-bold text-xl border border-black">Modified Date</th>
            <th className="p-4 border-b text-center text-black-600 font-bold text-xl border border-black">Modified Time</th>
            <th className="p-4 border-b text-center text-black-600 font-bold text-xl border border-black">Task Name</th>
            <th className="p-4px-4 border-b text-center text-black-600 font-bold text-xl border border-black">Modified Fields Historyb</th>
          </tr>
        </thead>
        <tbody>
          {history.map((change, index) => {
            const newStatusValue = change.newstatus?.value;
            const oldStatusValue = change.oldstatus?.value;

            if (newStatusValue === 'null' || newStatusValue == null || oldStatusValue === newStatusValue || (oldStatusValue == null && newStatusValue === '')) {
              return null;
            }

            // Determine if the changed field is owner
            const isOwnerChange = change.oldstatus.field === "owner";

            return (
              <tr key={index} className="hover:bg-gray-100 m-2">
                <td className="p-4 border border-black text-xl m-2">{new Date(change.changedAt || change.changedat).toLocaleString().split(",")[0]}</td>
                <td className="p-4 border border-black text-xl m-2">{new Date(change.changedAt || change.changedat).toLocaleString().split(",")[1]}</td>
                <td className="p-4 border border-black text-xl m-2">{change.taskname}  </td>
                <td className="p-4 border border-black text-xl m-2">
                  <strong>{change.changedby}</strong>&nbsp;
                  changed the field <strong>{change.oldstatus.field}</strong>&nbsp; 
                  from "<strong className="text-red-600">{isOwnerChange ? users.find(user => user._id === oldStatusValue)?.username : oldStatusValue}</strong>" 
                  &nbsp; to "<strong className="text-green-600">{isOwnerChange ? users.find(user => user._id === newStatusValue)?.username : newStatusValue}</strong>"
                  &nbsp; at <strong>{new Date(change.changedAt || change.changedat).toLocaleString()}</strong>.
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default History;
