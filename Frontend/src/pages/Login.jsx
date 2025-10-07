import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // FIXED: removed 's' from contexts
import logo from "../assets/logo.png";
import axios from "axios";
import API_URL from "../config/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Add timeout sa request para hindi forever mag-wait
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await axios.post(
        `${API_URL}/api/auth/login/api/auth/login`,
        { email, password },
        {
          signal: controller.signal,
          timeout: 10000, // Additional axios timeout
        }
      );

      clearTimeout(timeoutId);

      console.log("Login response:", response.data);

      // UPDATED validation - check for the correct response structure
      if (
        response.data &&
        response.data.success === true &&
        response.data.user &&
        response.data.user.email &&
        response.data.user.name &&
        response.data.user.id &&
        response.data.token &&
        typeof response.data.token === "string" &&
        response.data.token.length > 0 &&
        response.status === 200
      ) {
        // Additional validation: Try to decode token locally to make sure it's valid JWT
        try {
          const tokenParts = response.data.token.split(".");
          if (tokenParts.length !== 3) {
            throw new Error("Invalid JWT format");
          }

          // Decode payload (without verification, just to check structure)
          const payload = JSON.parse(atob(tokenParts[1]));
          if (!payload._id && !payload.id) {
            throw new Error("Invalid token payload - missing ID");
          }
          if (!payload.email) {
            throw new Error("Invalid token payload - missing email");
          }
        } catch (tokenError) {
          console.error("Token validation failed:", tokenError);
          setError("Invalid token received from server");
          return;
        }

        // Store user data sa context
        login(response.data.user);

        // Store user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        // Navigate based on role
        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (response.data.user.role === "employee") {
          navigate("/employee-dashboard");
        } else {
          navigate("/admin-dashboard"); // Default fallback
        }

        alert("Successfully logged in!");
      } else {
        console.error("Invalid response structure:", response.data);
        setError("Login failed - Server response incomplete or invalid");

        // Detailed logging for debugging
        console.error("Response details:");
        console.error("- success:", response.data?.success);
        console.error("- user exists:", !!response.data?.user);
        console.error("- user.name:", response.data?.user?.name);
        console.error("- user.email:", response.data?.user?.email);
        console.error("- user.id:", response.data?.user?.id);
        console.error("- token exists:", !!response.data?.token);
        console.error("- status:", response.status);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle timeout errors
      if (error.name === "AbortError" || error.code === "ECONNABORTED") {
        setError(
          "Connection timeout - Server may be down or database not connected"
        );
        return;
      }

      // Handle network errors
      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        setError(
          "Cannot connect to server - Make sure backend is running on port 3000"
        );
        return;
      }

      if (error.response) {
        const status = error.response.status;
        const errorMsg =
          error.response.data?.error ||
          error.response.data?.message ||
          "Login failed";

        console.log(`Server responded with status ${status}:`, errorMsg);

        if (status === 401) {
          setError("Invalid email or password");
        } else if (status === 500) {
          // Check if error message indicates database issues
          if (
            errorMsg.includes("Database") ||
            errorMsg.includes("connection") ||
            errorMsg.includes("ECONNREFUSED")
          ) {
            setError(
              "Database connection failed - Please make sure MySQL/XAMPP is running"
            );
          } else {
            setError("Server error - Please try again later");
          }
        } else {
          setError(`Server error (${status}): ${errorMsg}`);
        }
      } else if (error.request) {
        setError(
          "No response from server - Check if backend and MySQL are running"
        );
      } else {
        setError("Login failed - Unexpected error occurred");
      }
    } finally {
      setLoading(false);
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
              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/50">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  required
                  value={email}
                  className="w-full px-4 py-2 rounded-md bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[rgba(0,198,255,0.2)] transition"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={password}
                  className="w-full px-4 py-2 rounded-md bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[rgba(0,198,255,0.2)] transition"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-md font-bold text-white bg-gradient-to-r from-[#0072ff] to-[#00c6ff] hover:from-[#0052cc] hover:to-[#009ee3] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              {/* Debug info - i-remove mo to kapag production na */}
              <div className="mt-4 text-xs text-gray-400">
                <p>Test Credentials:</p>
                <p>Email: admin@company.com</p>
                <p>Password: admin123</p>
              </div>
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
