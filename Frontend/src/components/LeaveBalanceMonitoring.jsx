import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import API_URL from "../config/api";

const LeaveBalanceMonitoring = () => {
  const { user } = useContext(AuthContext);
  const [employeeBalances, setEmployeeBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const departments = ["HR", "IT", "Finance", "Operations", "Logistics"];
  const leaveTypes = [
    "Sick Leave",
    "Vacation Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
  ];

  useEffect(() => {
    fetchEmployeeBalances();
  }, [selectedYear]);

  const fetchEmployeeBalances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/leaves/balances?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setEmployeeBalances(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching employee balances:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveBalance = (balances, leaveType) => {
    const balance = balances.find((b) => b.leave_type === leaveType);
    if (!balance) return { approved_days: 0, pending_days: 0, remaining: 15 };

    const usedDays = parseInt(balance.approved_days) || 0;
    const pendingDays = parseInt(balance.pending_days) || 0;
    const allocated = 15; // Default allocation

    return {
      approved_days: usedDays,
      pending_days: pendingDays,
      remaining: allocated - usedDays,
    };
  };

  const filteredEmployees =
    departmentFilter === "all"
      ? employeeBalances
      : employeeBalances.filter((emp) => emp.department === departmentFilter);

  const getBalanceColor = (remaining) => {
    if (remaining >= 10) return "text-green-600 bg-green-50";
    if (remaining >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Leave Balance Monitoring</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor employee leave balances and usage
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-2 border rounded dark:bg-gray-700"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {filteredEmployees.length}
          </div>
          <div className="text-sm text-blue-700">Total Employees</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {
              filteredEmployees.filter(
                (emp) =>
                  getLeaveBalance(emp.balances, "Vacation Leave").remaining >=
                  10
              ).length
            }
          </div>
          <div className="text-sm text-green-700">High Balance</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {
              filteredEmployees.filter((emp) => {
                const balance = getLeaveBalance(
                  emp.balances,
                  "Vacation Leave"
                ).remaining;
                return balance >= 5 && balance < 10;
              }).length
            }
          </div>
          <div className="text-sm text-yellow-700">Medium Balance</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {
              filteredEmployees.filter(
                (emp) =>
                  getLeaveBalance(emp.balances, "Vacation Leave").remaining < 5
              ).length
            }
          </div>
          <div className="text-sm text-red-700">Low Balance</div>
        </div>
      </div>

      {/* Employee Balance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-medium">
            Employee Leave Balances ({selectedYear})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vacation Leave
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sick Leave
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emergency Leave
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => {
                  const vacationBalance = getLeaveBalance(
                    employee.balances,
                    "Vacation Leave"
                  );
                  const sickBalance = getLeaveBalance(
                    employee.balances,
                    "Sick Leave"
                  );
                  const emergencyBalance = getLeaveBalance(
                    employee.balances,
                    "Emergency Leave"
                  );
                  const totalRemaining =
                    vacationBalance.remaining +
                    sickBalance.remaining +
                    emergencyBalance.remaining;

                  return (
                    <tr
                      key={employee.employee_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {employee.employee_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.department}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getBalanceColor(
                            vacationBalance.remaining
                          )}`}
                        >
                          {vacationBalance.remaining} days
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Used: {vacationBalance.approved_days} | Pending:{" "}
                          {vacationBalance.pending_days}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getBalanceColor(
                            sickBalance.remaining
                          )}`}
                        >
                          {sickBalance.remaining} days
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Used: {sickBalance.approved_days} | Pending:{" "}
                          {sickBalance.pending_days}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getBalanceColor(
                            emergencyBalance.remaining
                          )}`}
                        >
                          {emergencyBalance.remaining} days
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Used: {emergencyBalance.approved_days} | Pending:{" "}
                          {emergencyBalance.pending_days}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {totalRemaining}
                        </div>
                        <div className="text-xs text-gray-500">days total</div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No employees found for selected filters
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

export default LeaveBalanceMonitoring;
