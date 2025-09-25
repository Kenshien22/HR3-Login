import React, { useState, useEffect } from "react";
import axios from "axios";

const AttendanceWidget = () => {
  const [clockStatus, setClockStatus] = useState({
    clockedIn: false,
    clockedOut: false,
    clockInTime: null,
    clockOutTime: null,
    workHours: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchAttendanceStatus();

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/attendance/status",
        getAuthHeaders()
      );

      if (response.data.success) {
        setClockStatus(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/attendance/clock-in",
        {},
        getAuthHeaders()
      );

      if (response.data.success) {
        alert("Successfully clocked in!");
        fetchAttendanceStatus();
      }
    } catch (error) {
      console.error("Clock in error:", error);
      alert(error.response?.data?.message || "Failed to clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!window.confirm("Are you sure you want to clock out?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/attendance/clock-out",
        {},
        getAuthHeaders()
      );

      if (response.data.success) {
        alert(
          `Successfully clocked out! Work hours: ${response.data.workHours}`
        );
        fetchAttendanceStatus();
      }
    } catch (error) {
      console.error("Clock out error:", error);
      alert(error.response?.data?.message || "Failed to clock out");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Current Time Display */}
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Current Time</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">
          {currentTime.toLocaleTimeString()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Clock In</p>
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {formatTime(clockStatus.clockInTime)}
          </p>
        </div>

        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Clock Out</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">
            {formatTime(clockStatus.clockOutTime)}
          </p>
        </div>

        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Work Hours</p>
          <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
            {clockStatus.workHours || "0"} hrs
          </p>
        </div>
      </div>

      {/* Clock In/Out Buttons */}
      <div className="flex justify-center gap-4">
        {!clockStatus.clockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={loading}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Processing..." : "Clock In"}
          </button>
        ) : !clockStatus.clockedOut ? (
          <button
            onClick={handleClockOut}
            disabled={loading}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Processing..." : "Clock Out"}
          </button>
        ) : (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✓ Work day completed
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total hours: {clockStatus.workHours}
            </p>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            clockStatus.clockedIn && !clockStatus.clockedOut
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          <span
            className={`w-2 h-2 mr-2 rounded-full ${
              clockStatus.clockedIn && !clockStatus.clockedOut
                ? "bg-green-500 animate-pulse"
                : "bg-gray-400"
            }`}
          ></span>
          {clockStatus.clockedIn && !clockStatus.clockedOut
            ? "Currently Working"
            : clockStatus.clockedOut
            ? "Off Duty"
            : "Not Clocked In"}
        </span>
      </div>
    </div>
  );
};

export default AttendanceWidget;
