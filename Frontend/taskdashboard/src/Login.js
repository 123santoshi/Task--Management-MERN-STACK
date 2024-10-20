import React, { useState } from 'react';
import "./tailwind.css";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import taskimg from "./tasks.jpg"

const Login = () => {
  const [email, setEmail] = useState('');
  const [enterOtp, setEnterOtp] = useState(''); 
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState(''); 
  const [otpErrorMsg, setOtpErrorMsg] = useState(''); 
  const [role, setRole] = useState("");

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
      setOtpSuccessMsg("OTP sent successfully!");
      setOtpErrorMsg(''); 
    } catch (error) {
      if (error.response && error.response.data) {
        setOtpErrorMsg(error.response.data.message);
        setOtpSuccessMsg('');
      } else {
        setOtpErrorMsg("An error occurred while sending the OTP.");
        setOtpSuccessMsg(''); 
      }
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/users/verify-otp", { email, otp: enterOtp });
      setOtpSuccessMsg("OTP verified successfully!");
      setRole(response.data.role);
      setOtpErrorMsg('');

      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);

      if (response.data.role === 'User') {
        navigate("/userdashboard"); 
      } else {
        navigate("/home");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setOtpErrorMsg(error.response.data.message);
        setOtpSuccessMsg('');
      } else {
        setOtpErrorMsg("An error occurred while verifying the OTP.");
        setOtpSuccessMsg('');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-10">
      <div className="flex w-full bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left side with the image */}
        <div className="hidden md:flex w-3/4 bg-cover">
          <img src={taskimg} alt="Tasks" className="w-full object-cover"/>          
        </div>
  
        <div className="flex items-center justify-center w-full md:w-1/4 p-10">
          <form className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>

            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                name="email"
                onChange={changeHandler}
                required
                className="w-full p-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {showOtpBox && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={sendOtp}
                  className="w-full p-5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200"
                >
                  Send OTP
                </button>
              </div>
            )}

            {otpSuccessMsg && (
              <>
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Enter OTP" 
                    name="otp" 
                    value={enterOtp}
                    onChange={otpHandler} 
                    className="w-full p-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <button 
                    type="button"
                    onClick={verifyOtp} 
                    className="w-full p-5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200"
                  >
                    Verify OTP
                  </button>
                </div>
              </>
            )}

            {otpSuccessMsg && (
              <p className="text-green-600 font-medium mb-4">{otpSuccessMsg}. Please check your email for the OTP.</p>
            )}

            {otpErrorMsg && (
              <p className="text-red-600 font-medium mb-4">{otpErrorMsg}</p>
            )}

              <br/>
            <p className="text-center text-xl font-bold text-red-400 mt-4">
              Don't have an account ? Click here to <Link to="/" className="text-blue-500 hover:underline">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
