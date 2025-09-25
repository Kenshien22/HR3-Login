import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("password");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Module states - ALL ENABLED
  const [timeAttendanceOpen, setTimeAttendanceOpen] = useState(false);
  const [shiftScheduleOpen, setShiftScheduleOpen] = useState(false);
  const [timesheetOpen, setTimesheetOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [claimsOpen, setClaimsOpen] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // API call to change password
      const response = await axios.post(
        "http://localhost:3000/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password",
      });
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

  return (
    <div
      className={`flex h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Sidebar - SAME AS ADMIN DASHBOARD */}
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
            (HUMAN RESOURCES 3)
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          <nav className="space-y-2">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors w-full text-left"
            >
              Dashboard
            </button>

            {/* Time and Attendance - CLICKABLE */}
            <div className="relative">
              <button
                onClick={() => {
                  setTimeAttendanceOpen(!timeAttendanceOpen);
                }}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Time and Attendance</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    timeAttendanceOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {timeAttendanceOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "time-attendance",
                          subSection: "location-tracking",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Location Based Tracking
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "time-attendance",
                          subSection: "attendance-records",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Attendance Records
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "time-attendance",
                          subSection: "overtime-hours",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Overtime & Extra Hours
                  </button>
                </div>
              )}
            </div>

            {/* Shift and Schedule - CLICKABLE */}
            <div className="relative">
              <button
                onClick={() => setShiftScheduleOpen(!shiftScheduleOpen)}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Shift and Schedule</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    shiftScheduleOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {shiftScheduleOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "shift-schedule",
                          subSection: "employee-schedule",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Employee Schedule
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "shift-schedule",
                          subSection: "employee-shift",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Employee Shift
                  </button>
                </div>
              )}
            </div>

            {/* Timesheet - CLICKABLE */}
            <div className="relative">
              <button
                onClick={() => setTimesheetOpen(!timesheetOpen)}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Timesheet</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    timesheetOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {timesheetOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "timesheet",
                          subSection: "attendance-records",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Attendance Records
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "timesheet",
                          subSection: "work-hours",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Work Hours Logging
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "timesheet",
                          subSection: "leave-records",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Leave Records
                  </button>
                </div>
              )}
            </div>

            {/* Leave - CLICKABLE */}
            <div className="relative">
              <button
                onClick={() => setLeaveOpen(!leaveOpen)}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Leave</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    leaveOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {leaveOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "leave",
                          subSection: "leave-approval",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Leave Approval
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "leave",
                          subSection: "leave-balance",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Leave Balance Monitoring
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: { section: "leave", subSection: "leave-dates" },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Leave Dates and Status
                  </button>
                </div>
              )}
            </div>

            {/* Claims - CLICKABLE */}
            <div className="relative">
              <button
                onClick={() => setClaimsOpen(!claimsOpen)}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Claims&Reimbursement</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    claimsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {claimsOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "claims",
                          subSection: "claims-submission",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Employee Claims Submission
                  </button>
                  <button
                    onClick={() =>
                      navigate("/admin-dashboard", {
                        state: {
                          section: "claims",
                          subSection: "reimbursement",
                        },
                      })
                    }
                    className="block py-1 px-3 text-sm text-gray-300 hover:text-white w-full text-left"
                  >
                    Employee Reimbursement
                  </button>
                </div>
              )}
            </div>

            <button className="block py-2 px-4 rounded bg-teal-600 text-white w-full text-left">
              System Settings
            </button>

            <button
              onClick={handleLogout}
              className="block py-2 px-4 rounded hover:bg-gray-700 w-full text-left"
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
                System Settings
                <span className="text-teal-500 ml-2 text-sm">
                  | (HUMAN RESOURCES 3)
                </span>
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Logged in as: {user?.email || "Admin"}
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

        {/* Settings Content */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab("password")}
                className={`px-4 py-2 rounded ${
                  activeTab === "password"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2 rounded ${
                  activeTab === "about"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                About System
              </button>
            </div>

            {/* Password Change Tab */}
            {activeTab === "password" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Change Password
                </h3>

                {message.text && (
                  <div
                    className={`mb-4 p-3 rounded ${
                      message.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  About HR3 System
                </h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>System Name:</strong> Human Resources 3 (HR3)
                    Subsystem
                  </p>
                  <p>
                    <strong>Version:</strong> 1.0.0
                  </p>
                  <p>
                    <strong>Framework:</strong> React + Node.js + MySQL
                  </p>
                  <p>
                    <strong>Authentication:</strong> JWT-based
                  </p>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Modules:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Employee Management</li>
                      <li>Time and Attendance Tracking</li>
                      <li>Shift and Schedule Management</li>
                      <li>Timesheet Management</li>
                      <li>Leave Management System</li>
                      <li>Claims and Reimbursement</li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t dark:border-gray-700">
                    <p className="text-sm text-gray-500">
                      © 2024 SLATE Freight Management System
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
