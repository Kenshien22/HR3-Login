import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";

const TimeAttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchRecords, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchRecords = async () => {
    try {
      const response = await axios.get(
        "${API_URL}/api/attendance/all",
        getAuthHeaders()
      );

      if (response.data.success) {
        // Filter today's records only for real-time view
        const today = new Date().toISOString().split("T")[0];
        const todayRecords = response.data.data.filter(
          (record) => record.date === today
        );
        setRecords(todayRecords);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (datetime) => {
    if (!datetime) return "--:--";
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Today's Attendance - Real Time
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Clock In</th>
              <th className="p-3 text-left">Clock Out</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Late By</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No attendance records for today
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="border-b dark:border-gray-700">
                  <td className="p-3">{record.Employee?.fullName}</td>
                  <td className="p-3">{record.Employee?.department}</td>
                  <td className="p-3 text-blue-600">
                    {formatTime(record.clockIn)}
                  </td>
                  <td className="p-3 text-green-600">
                    {formatTime(record.clockOut)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        record.status === "present"
                          ? "bg-green-100 text-green-800"
                          : record.status === "late"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {record.lateMinutes > 0
                      ? `${record.lateMinutes} mins`
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Auto-refresh every 30 seconds • Last updated:{" "}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default TimeAttendanceRecords;
