import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";

const LeaveRecords = () => {
  const { user } = useContext(AuthContext);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [leaveSummary, setLeaveSummary] = useState({
    totalLeaveDays: 0,
    employeeLeaves: [],
  });

  useEffect(() => {
    fetchLeaveData();
  }, [selectedMonth]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [year, month] = selectedMonth.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL ||
          "http://localhost:3000"
        }/api/timesheet?start_date=${startDate}&end_date=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data) {
        calculateLeaveData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaveData = (data) => {
    // Filter only "On Leave" records
    const leaveRecords = data.filter(
      (record) =>
        record.attendance_status === "On Leave" ||
        record.attendance_status === "Leave" ||
        record.attendance_status === "Absent" ||
        record.attendance_status === "Sick Leave" ||
        record.attendance_status === "Vacation Leave"
    );

    // Group by employee
    const employeeLeaveData = {};

    leaveRecords.forEach((record) => {
      const empId = record.employee_id;
      if (!employeeLeaveData[empId]) {
        employeeLeaveData[empId] = {
          name: record.employee_name || `Employee ${empId}`,
          department: record.department,
          leaveDays: [],
          totalDays: 0,
        };
      }

      employeeLeaveData[empId].leaveDays.push(
        new Date(record.date).toLocaleDateString()
      );
      employeeLeaveData[empId].totalDays++;
    });

    setLeaveSummary({
      totalLeaveDays: leaveRecords.length,
      employeeLeaves: Object.values(employeeLeaveData),
    });
  };

  // Generate calendar view
  const generateCalendar = () => {
    const [year, month] = selectedMonth.split("-");
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    let week = new Array(startingDayOfWeek).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}/${day}/${year}`;
      const hasLeave = leaveSummary.employeeLeaves.some((emp) =>
        emp.leaveDays.includes(
          new Date(year, month - 1, day).toLocaleDateString()
        )
      );

      week.push({ day, hasLeave });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      calendar.push(week);
    }

    return calendar;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Month
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">
            {leaveSummary.totalLeaveDays}
          </div>
          <div className="text-sm text-purple-700">Total Leave Days</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {leaveSummary.employeeLeaves.length}
          </div>
          <div className="text-sm text-blue-700">Employees on Leave</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {leaveSummary.totalLeaveDays > 0
              ? (
                  leaveSummary.totalLeaveDays /
                  leaveSummary.employeeLeaves.length
                ).toFixed(1)
              : 0}
          </div>
          <div className="text-sm text-green-700">Avg Days per Employee</div>
        </div>
      </div>

      {/* Leave Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Leave Calendar</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <th
                      key={day}
                      className="px-2 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {day}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {generateCalendar().map((week, weekIdx) => (
                <tr key={weekIdx}>
                  {week.map((day, dayIdx) => (
                    <td
                      key={dayIdx}
                      className="px-2 py-2 text-center border border-gray-200 dark:border-gray-700"
                    >
                      {day && (
                        <div
                          className={`p-2 rounded ${
                            day.hasLeave
                              ? "bg-purple-100 text-purple-700 font-bold"
                              : ""
                          }`}
                        >
                          {day.day}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 rounded"></div>
            <span>Has Leave</span>
          </div>
        </div>
      </div>

      {/* Employee Leave Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Leave Details by Employee</h3>
        </div>
        <div className="p-4">
          {leaveSummary.employeeLeaves.length > 0 ? (
            <div className="space-y-3">
              {leaveSummary.employeeLeaves.map((emp, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-gray-500">
                        {emp.department || "N/A"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {emp.totalDays}
                      </div>
                      <div className="text-sm text-gray-500">days</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">Leave Dates:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {emp.leaveDays.map((date, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs"
                        >
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No leave records for selected month
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRecords;
