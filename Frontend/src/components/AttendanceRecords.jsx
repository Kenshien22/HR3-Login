import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";

const AttendanceRecords = () => {
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
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [summary, setSummary] = useState({});
  const [employeeSummary, setEmployeeSummary] = useState([]);

  useEffect(() => {
    fetchTimesheets();
  }, [selectedMonth, selectedDepartment]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Parse month to get date range
      const [year, month] = selectedMonth.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      if (selectedDepartment !== "all") {
        params.append("department", selectedDepartment);
      }

      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL ||
          "http://localhost:3000"
        }/api/timesheet?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data) {
        setTimesheets(response.data.data);
        calculateSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    // Overall summary
    const stats = {
      totalDays: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
    };

    // Group by employee
    const empData = {};

    data.forEach((record) => {
      // Overall stats
      stats.totalDays++;
      switch (record.attendance_status) {
        case "Present":
          stats.present++;
          break;
        case "Absent":
          stats.absent++;
          break;
        case "Late":
          stats.late++;
          break;
        case "Half Day":
          stats.halfDay++;
          break;
        case "On Leave":
          stats.onLeave++;
          break;
      }

      // Employee stats
      const empId = record.employee_id;
      if (!empData[empId]) {
        empData[empId] = {
          name: record.employee_name || `Employee ${empId}`,
          department: record.department,
          totalDays: 0,
          present: 0,
          absent: 0,
          late: 0,
          attendanceRate: 0,
        };
      }

      empData[empId].totalDays++;
      if (
        record.attendance_status === "Present" ||
        record.attendance_status === "Late"
      ) {
        empData[empId].present++;
      } else if (record.attendance_status === "Absent") {
        empData[empId].absent++;
      }
    });

    // Calculate attendance rate per employee
    Object.values(empData).forEach((emp) => {
      emp.attendanceRate =
        emp.totalDays > 0 ? Math.round((emp.present / emp.totalDays) * 100) : 0;
    });

    setSummary(stats);
    setEmployeeSummary(Object.values(empData));
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
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Departments</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {summary.present || 0}
            </div>
            <div className="text-sm text-green-700">Days Present</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {summary.absent || 0}
            </div>
            <div className="text-sm text-red-700">Days Absent</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {summary.late || 0}
            </div>
            <div className="text-sm text-yellow-700">Days Late</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summary.halfDay || 0}
            </div>
            <div className="text-sm text-blue-700">Half Days</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {summary.onLeave || 0}
            </div>
            <div className="text-sm text-purple-700">On Leave</div>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-teal-600">
              {summary.totalDays > 0
                ? ((summary.present / summary.totalDays) * 100).toFixed(1)
                : 0}
              %
            </div>
            <div className="text-sm text-teal-700">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Late Arrivals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Late Arrivals</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {timesheets
              .filter((timesheet) => timesheet.attendance_status === "Late")
              .slice(0, 5)
              .map((timesheet, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded"
                >
                  <div>
                    <div className="font-medium">{timesheet.employee_name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(timesheet.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      Arrived: {timesheet.clock_in || "Time not recorded"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(() => {
                        if (timesheet.clock_in) {
                          if (timesheet.clock_in) {
                            const clockIn = new Date(
                              `2000-01-01 ${timesheet.clock_in}`
                            );
                            const nineAM = new Date(`2000-01-01 09:00:00`);
                            const diffMinutes = Math.floor(
                              (clockIn - nineAM) / (1000 * 60)
                            );
                            return diffMinutes > 0
                              ? `${diffMinutes} min late`
                              : "On time";
                          }
                          return "Time not recorded";
                          return diffMinutes > 0
                            ? `${diffMinutes} min late`
                            : "On time";
                        }
                        return "No clock in";
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            {timesheets.filter((t) => t.attendance_status === "Late").length ===
              0 && (
              <p className="text-center text-gray-500 py-4">
                No late arrivals this month
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Rate by Employee */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Attendance Rate by Employee</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {employeeSummary.length > 0 ? (
              employeeSummary.map((emp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-sm text-gray-500">
                      {emp.department || "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {emp.attendanceRate}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {emp.present}/{emp.totalDays} days
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No data for selected period
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecords;
