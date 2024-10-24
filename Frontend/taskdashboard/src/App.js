import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Signup from "./Signup";
import Login from './Login';
import Users from './Users';
import AddEditUser from "./AddEditUser";
import Tasks from './Tasks';
import AddEditTask from './AddEditTask';
import Taskdashboard from './Taskdashboard';
import ManualTimeLog from './ManualTimeLog';
import TimeLogReport from './TimeLogReport';
import TaskCountBasedOnUsers from './TaskCountBasedOnUsers';
import TaskCountBasedOnStatus from './TaskCountBasedOnStatus';
import TaskCountBasedOnPriority from './TaskCountBasedOnPriority';
import TotalTaskTime from './TotalTaskTime';
import Home from './Home';
import Reports from './Reports';
import UserDashboard from './UserDashboard';
import History from './History';
import Userreport from './Userreport';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isAdmin, setAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'User') {
      setAdmin(false);
    } else {
      setAdmin(true);
    }
  }, []);
 
  return (
    <div className="App">
      <BrowserRouter>
        <AppRoutes isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
      </BrowserRouter>
    </div>
  );
}

function AppRoutes({ isAuthenticated, isAdmin }) {
  const loc = useLocation();
  const hideHome = loc.pathname === '/' || loc.pathname === '/login' || loc.pathname === "/userdashboard" || loc.pathname === "/userreport";

  return (
    <>
      {!hideHome && isAdmin && <Home />} 
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/userreport" element={<Userreport />} />

        {isAdmin && (
          <>
            <Route path="/users" element={<Users />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reports" element={<Reports />}>
              <Route index element={<TimeLogReport />} />
              <Route path="timelogreport" element={<TimeLogReport />} />
              <Route path="taskcountstatus" element={<TaskCountBasedOnStatus />} />
              <Route path="taskcountusers" element={<TaskCountBasedOnUsers />} />
              <Route path="taskcountpriority" element={<TaskCountBasedOnPriority />} />
              <Route path="totaltasktime" element={<TotalTaskTime />} />
            </Route>
            <Route path="/edituser/:id" element={<AddEditUser />} />
            <Route path="/adduser" element={<AddEditUser />} />
            <Route path="/edittask/:id" element={<AddEditTask />} />
            <Route path="/addtask" element={<AddEditTask />} />
            <Route path="/taskdashboard" element={<Taskdashboard />} />
            <Route path="/history" element={<History />} />
          </>
        )}

        <Route path="/manualtimelog/:id" element={<ManualTimeLog />} />
        <Route path="*" element={isAdmin ? <Navigate to="/users" /> : <Navigate to="/userdashboard" />} />
      </Routes>
    </>
  );
}

export default App;
