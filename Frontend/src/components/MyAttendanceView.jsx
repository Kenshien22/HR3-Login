import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeAttendanceView = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalDays: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/attendance/my-records",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAttendance(response.data.data);
        calculateSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const stats = {
      totalDays: data.length,
      present: data.filter((d) => d.status === "present").length,
      late: data.filter((d) => d.status === "late").length,
      absent: data.filter((d) => d.status === "absent").length,
    };
    setSummary(stats);
  };

  const formatTime = (datetime) => {
    if (!datetime) return "--:--";
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div>Loading attendance records...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {summary.totalDays}
          </div>
          <div className="text-sm text-gray-600">Total Days</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {summary.present}
          </div>
          <div className="text-sm text-gray-600">Present</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {summary.late}
          </div>
          <div className="text-sm text-gray-600">Late</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {summary.absent}
          </div>
          <div className="text-sm text-gray-600">Absent</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">My Attendance History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Clock In</th>
                <th className="p-3 text-left">Clock Out</th>
                <th className="p-3 text-left">Hours</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Late By</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No attendance records yet
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="p-3">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">{formatTime(record.clockIn)}</td>
                    <td className="p-3">{formatTime(record.clockOut)}</td>
                    <td className="p-3">{record.workHours || 0} hrs</td>
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
      </div>
    </div>
  );
};

export default EmployeeAttendanceView;
