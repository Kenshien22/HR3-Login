import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AttendanceWidget from "../components/AttendanceWidget";
import EmployeeScheduleView from "../components/EmployeeScheduleView";
import MyAttendanceView from "../components/MyAttendanceView";
import LeaveRequest from "../components/LeaveRequest";
import ClaimsSubmission from "../components/ClaimsSubmission";
import API_URL from "../config/api";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "admin") {
      // If admin accidentally comes here, redirect to admin dashboard
      navigate("/admin-dashboard");
    } else {
      fetchEmployeeData();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch employee data using email
      const response = await axios.get(`${API_URL}/api/employees/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setEmployeeData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 text-white w-64 flex-shrink-0 ${
          darkMode ? "bg-gray-950" : "bg-gray-800"
        } ${sidebarOpen ? "ml-0" : "-ml-64"} flex flex-col h-screen`}
      >
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/src/assets/logo.png"
              alt="SLATE Logo"
              className="h-12 w-auto"
            />
          </div>
          <div className="text-center text-teal-400 font-bold mb-6 pb-4 border-b border-gray-700">
            EMPLOYEE PORTAL
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentSection("dashboard")}
              className={
                currentSection === "dashboard"
                  ? "block py-2 px-4 rounded bg-teal-600 text-white w-full text-left"
                  : "block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors w-full text-left"
              }
            >
              My Dashboard
            </button>

            <button
              onClick={() => setCurrentSection("profile")}
              className={
                currentSection === "profile"
                  ? "block py-2 px-4 rounded bg-teal-600 text-white w-full text-left"
                  : "block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors w-full text-left"
              }
            >
              My Profile
            </button>

            <button
              onClick={() => setCurrentSection("attendance")}
              className={
                currentSection === "attendance"
                  ? "block py-2 px-4 rounded bg-teal-600 text-white w-full text-left"
                  : "block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors w-full text-left"
              }
            >
              My Attendance
            </button>
            <button
              onClick={() => setCurrentSection("my-schedule")}
              className={
                currentSection === "my-schedule"
                  ? "w-full text-left px-4 py-2 bg-teal-600 text-white"
                  : "w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
              }
            >
              My Schedule
            </button>
            <button
              onClick={() => setCurrentSection("leave")}
              className={
                currentSection === "leave"
                  ? "block py-2 px-4 rounded bg-teal-600 text-white w-full text-left"
                  : "block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors w-full text-left"
              }
            >
              Leave Request
            </button>

            <button
              onClick={() => setCurrentSection("claims")}
              className={
                currentSection === "claims"
                  ? "block py-2 px-4 rounded bg-teal-600 text-white w-full text-left"
                  : "block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors w-full text-left"
              }
            >
              Submit Claims
            </button>

            <button
              onClick={handleLogout}
              className="block py-2 px-4 rounded hover:bg-gray-700 w-full text-left mt-8"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header
          className={`shadow-sm p-4 flex justify-between items-center border-b ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className={`mr-4 p-2 rounded-full ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              ☰
            </button>
            <div>
              <h1
                className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Employee Dashboard
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Welcome, {user?.name || user?.email || "Employee"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span
              className={`text-sm mr-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Dark Mode
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div
                className={`w-14 h-7 rounded-full peer focus:outline-none transition-all after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${
                  darkMode
                    ? "bg-teal-600 after:translate-x-7 after:border-white"
                    : "bg-gray-300 after:border-gray-300"
                }`}
              ></div>
            </label>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {currentSection === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Welcome to Employee Portal
              </h2>

              {/* CLOCK IN/OUT CARD - ADD THIS */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Time & Attendance
                </h3>
                <AttendanceWidget />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-blue-500 dark:text-blue-400 mb-2">
                    Employee ID
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {employeeData?.employeeId || user?.email}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-green-500 dark:text-green-400 mb-2">
                    Department
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {employeeData?.department || "Not Assigned"}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-purple-500 dark:text-purple-400 mb-2">
                    Position
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {employeeData?.position || "Not Assigned"}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ This portal is under development. More features coming
                  soon!
                </p>
              </div>
            </div>
          )}

          {currentSection === "profile" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">My Profile</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Profile management coming soon...
              </p>
            </div>
          )}

          {currentSection === "attendance" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                My Attendance
              </h2>
              <MyAttendanceView />
            </div>
          )}

          {currentSection === "leave" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Leave Request
              </h2>
              <LeaveRequest />
            </div>
          )}

          {currentSection === "claims" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Submit Claims
              </h2>
              <ClaimsSubmission />
            </div>
          )}

          {currentSection === "my-schedule" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                My Schedule
              </h2>
              <EmployeeScheduleView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
