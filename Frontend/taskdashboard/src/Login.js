import React, { useState } from 'react';
import "./tailwind.css";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [enterOtp, setEnterOtp] = useState(''); 
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState(''); 
  const [otpErrorMsg, setOtpErrorMsg] = useState(''); 
  const [role,setRole]= useState("");

  const navigate = useNavigate();

  const changeHandler = (e) => {
    setEmail(e.target.value);
    setShowOtpBox(true);
  };

  const otpHandler = (e) => {
    setEnterOtp(e.target.value);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/users/send-otp", { email });
      console.log("OTP sent response:", response.data);
      setOtpSuccessMsg("OTP sent successfully!");
      setOtpErrorMsg(''); 
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Error sending OTP:", error.response.data);
        setOtpErrorMsg(error.response.data.message);
        setOtpSuccessMsg('');
      } else {
        console.error("Error sending OTP:", error.message);
        setOtpErrorMsg("An error occurred while sending the OTP.");
        setOtpSuccessMsg(''); 
      }
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/users/verify-otp", { email, otp: enterOtp });
      console.log("OTP verification response:", response.data);
      setOtpSuccessMsg("OTP verified successfully!");
      console.log("role==",response.data.role);
      setRole(response.data.role);
      setOtpErrorMsg('');

      // Store the role in local storage or global state
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);
      
      if (response.data.role === 'User') {
        navigate("/userdashboard"); 
      } else {
        navigate("/home");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Error verifying OTP:", error.response.data);
        setOtpErrorMsg(error.response.data.message);
        setOtpSuccessMsg('');
      } else {
        console.error("Error verifying OTP:", error.message);
        setOtpErrorMsg("An error occurred while verifying the OTP.");
        setOtpSuccessMsg('');
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen border-2 bg-gray-100">
      <form className="p-6 bg-white shadow-md rounded bg-white-100 border-black">
        <h1 className="text-2xl text-red-500 font-bold mb-4">Login</h1>

        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          name="email"
          onChange={changeHandler}
          required
          className="w-full px-4 py-4  border-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {showOtpBox && (
          <button
            type="button" // Change type to button to prevent form submission
            onClick={sendOtp}
            className="w-full mt-4 p-5 bg-blue-500 text-white rounded"
          >
            Send OTP
          </button>
        )}

        <br/><br/>
        {otpSuccessMsg && 
          <>
            <input 
              type="text" 
              placeholder="Enter OTP" 
              name="otp" 
              value={enterOtp}
              onChange={otpHandler} 
              className="w-full p-5 border border-black-300 rounded mb-4"
            />

            <button 
              type="button" // Change type to button to prevent form submission
              onClick={verifyOtp} 
              className="w-full mt-4 p-5 bg-blue-500 text-white rounded"
            >
              Verify OTP
            </button>
          </>
        }

        <br/><br/>

        {otpSuccessMsg && <p className="text-green-500 font-bold">{otpSuccessMsg}. Please check your email for the OTP.</p>}
        {otpErrorMsg && <p className="text-red-500 font-bold">{otpErrorMsg}</p>}

        <h3 className='text-red-500 font-bold font-25px'>Don't have an account ? Click here to <Link to="/">SignUp</Link></h3>
      </form>
    </div>
  );
};

export default Login;
