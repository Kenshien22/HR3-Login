import React, { useState } from "react";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-[1200px] flex bg-[rgba(31,42,56,0.8)] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex-col md:flex-row">
          {/* Welcome Panel */}
          <div className="flex-1 flex items-center justify-center p-10 md:p-16 bg-gradient-to-br from-[rgba(0,114,255,0.2)] to-[rgba(0,198,255,0.2)]">
            <h1 className="text-2xl md:text-4xl font-bold text-white text-center drop-shadow-[2px_2px_8px_rgba(0,0,0,0.6)]">
              FREIGHT MANAGEMENT SYSTEM
            </h1>
          </div>

          {/* Login Panel */}
          <div className="w-full md:w-[400px] p-10 md:p-16 bg-[rgba(22,33,49,0.95)] flex items-center justify-center">
            <div className="w-full text-center">
              <img src={logo} alt="Logo" className="w-24 h-auto mx-auto mb-5" />
              <h2 className="mb-6 text-white text-2xl font-semibold">
                SLATE Login
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  required
                  className="w-full px-4 py-2 rounded-md bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[rgba(0,198,255,0.2)] transition"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2 rounded-md bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[rgba(0,198,255,0.2)] transition"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-md font-bold text-white bg-gradient-to-r from-[#0072ff] to-[#00c6ff] hover:from-[#0052cc] hover:to-[#009ee3] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)] transition"
                >
                  Log In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center p-5 bg-[rgba(0,0,0,0.2)] text-[rgba(255,255,255,0.7)] text-sm">
        &copy; 2023 SLATE Freight Management System. All rights reserved.
      </footer>
    </div>
  );
};
export default Login;
