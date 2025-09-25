import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";

const OvertimeHours = () => {
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
  const [hoursSummary, setHoursSummary] = useState({});
  const [employeeHours, setEmployeeHours] = useState([]);

  useEffect(() => {
    fetchTimesheets();
  }, [selectedMonth]);

  const fetchTimesheets = async () => {
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
        setTimesheets(response.data.data);
        calculateHours(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (data) => {
    let totalRegular = 0;
    let totalOvertime = 0;
    const empHours = {};

    data.forEach((record) => {
      const hours = parseFloat(record.total_hours) || 0;
      // Calculate overtime: hours > 8 per day = overtime
      const regularHours = Math.min(hours, 8);
      const overtimeHours = Math.max(hours - 8, 0);

      totalRegular += regularHours;
      totalOvertime += overtimeHours;

      const empId = record.employee_id;
      if (!empHours[empId]) {
        empHours[empId] = {
          name: record.employee_name || `Employee ${empId}`,
          department: record.department,
          regularHours: 0,
          overtimeHours: 0,
          totalHours: 0,
        };
      }

      empHours[empId].regularHours += regularHours;
      empHours[empId].overtimeHours += overtimeHours;
      empHours[empId].totalHours += hours;
    });

    setHoursSummary({
      totalHours: totalRegular + totalOvertime,
      regularHours: totalRegular,
      overtimeHours: totalOvertime,
    });

    setEmployeeHours(Object.values(empHours));
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

      {/* Monthly Hours Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Monthly Hours Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {hoursSummary.totalHours?.toFixed(1) || 0}
            </div>
            <div className="text-sm text-blue-700">Total Hours</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {hoursSummary.regularHours?.toFixed(1) || 0}
            </div>
            <div className="text-sm text-green-700">Regular Hours</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {hoursSummary.overtimeHours?.toFixed(1) || 0}
            </div>
            <div className="text-sm text-orange-700">Overtime Hours</div>
          </div>
        </div>
      </div>
      {/* Top Overtime Workers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            Top Overtime Workers This Month
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {employeeHours
              .filter((emp) => emp.overtimeHours > 0)
              .sort((a, b) => b.overtimeHours - a.overtimeHours)
              .slice(0, 5)
              .map((emp, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded"
                >
                  <div>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-sm text-gray-500">
                      {emp.department || "N/A"} • Regular:{" "}
                      {emp.regularHours.toFixed(1)}h
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {emp.overtimeHours.toFixed(1)}h
                    </div>
                    <div className="text-xs text-gray-500">overtime</div>
                  </div>
                </div>
              ))}
            {employeeHours.filter((emp) => emp.overtimeHours > 0).length ===
              0 && (
              <p className="text-center text-gray-500 py-4">
                No overtime hours recorded this month
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Hours by Employee */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Hours by Employee</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Regular
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overtime
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {employeeHours.length > 0 ? (
                employeeHours.map((emp, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-gray-500">
                        {emp.department || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {emp.regularHours.toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3 text-right text-orange-600">
                      {emp.overtimeHours.toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {emp.totalHours.toFixed(1)} hrs
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data for selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OvertimeHours;
