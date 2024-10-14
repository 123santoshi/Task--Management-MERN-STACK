import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import TotalTaskTime from './TotalTaskTime';
import Home from './Home';
import Reports from './Reports';
import UserDashboard from './UserDashboard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

function AppRoutes() {
  const loc = useLocation();
  const hideHome = loc.pathname === '/' || loc.pathname === '/login' || loc.pathname==="/userdashboard";

  return (
    <>
      {!hideHome && <Home />}
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<Users />} />
        <Route path="/userdashboard" element={<UserDashboard/>}   />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/reports" element={<Reports />}>
          <Route index element={<TimeLogReport />} />
          <Route path="timelogreport" element={<TimeLogReport />} />
          <Route path="taskcountstatus" element={<TaskCountBasedOnStatus />} />
          <Route path="taskcountusers" element={<TaskCountBasedOnUsers />} />
          <Route path="totaltasktime" element={<TotalTaskTime />} />
        </Route>
        <Route path="/edituser/:id" element={<AddEditUser />} />
        <Route path="/adduser" element={<AddEditUser />} />
        <Route path="/edittask/:id" element={<AddEditTask />} />
        <Route path="/addtask" element={<AddEditTask />} />
        <Route path="/taskdashboard" element={<Taskdashboard />} />
        <Route path="/manualtimelog/:id" element={<ManualTimeLog />} />

        {/* Default redirect from root to users */}
        <Route path="*" element={<Navigate to="/users" />} />
      </Routes>
    </>
  );
}

export default App;
