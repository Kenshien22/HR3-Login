import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import API_URL from "../config/api";

const LeaveDatesStatus = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const leaveStatuses = ["Pending", "Approved", "Rejected"];
  const leaveTypes = [
    "Sick Leave",
    "Vacation Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
  ];
  const departments = ["HR", "IT", "Finance", "Operations", "Logistics"];

  useEffect(() => {
    fetchLeaves();
  }, [selectedMonth, statusFilter, typeFilter, departmentFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [year, month] = selectedMonth.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      if (statusFilter !== "all") params.append("leave_status", statusFilter);
      if (typeFilter !== "all") params.append("leave_type", typeFilter);
      if (departmentFilter !== "all")
        params.append("department", departmentFilter);

      const response = await axios.get(`${API_URL}/api/leaves?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setLeaves(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      "Sick Leave": "bg-blue-100 text-blue-700",
      "Vacation Leave": "bg-purple-100 text-purple-700",
      "Emergency Leave": "bg-orange-100 text-orange-700",
      "Maternity Leave": "bg-pink-100 text-pink-700",
      "Paternity Leave": "bg-indigo-100 text-indigo-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const groupedLeaves = leaves.reduce((acc, leave) => {
    const date = leave.start_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(leave);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLeaves).sort();

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
          <h2 className="text-xl font-semibold">Leave Dates and Status</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track all leave requests by date and status
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="all">All Status</option>
              {leaveStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Leave Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="all">All Types</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {leaves.length}
          </div>
          <div className="text-sm text-blue-700">Total Requests</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {leaves.filter((l) => l.leave_status === "Pending").length}
          </div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {leaves.filter((l) => l.leave_status === "Approved").length}
          </div>
          <div className="text-sm text-green-700">Approved</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {leaves.filter((l) => l.leave_status === "Rejected").length}
          </div>
          <div className="text-sm text-red-700">Rejected</div>
        </div>
      </div>

      {/* Leave Records by Date */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-medium">Leave Records by Date</h3>
        </div>

        {sortedDates.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedDates.map((date) => (
              <div key={date} className="p-4">
                <h4 className="font-medium text-lg mb-3 text-gray-800 dark:text-gray-200">
                  {formatDate(date)}
                </h4>
                <div className="space-y-3">
                  {groupedLeaves[date].map((leave) => (
                    <div
                      key={leave.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-medium">
                              {leave.employee_name}
                            </h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(
                                leave.leave_type
                              )}`}
                            >
                              {leave.leave_type}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                leave.leave_status
                              )}`}
                            >
                              {leave.leave_status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {leave.department} • {formatDate(leave.start_date)}{" "}
                            to {formatDate(leave.end_date)} •{" "}
                            {leave.days_requested} days
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {leave.reason}
                          </p>
                          {leave.remarks && (
                            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-sm">
                              <span className="font-medium">Remarks:</span>{" "}
                              {leave.remarks}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>Submitted: {formatDate(leave.createdAt)}</div>
                          {leave.approved_date && (
                            <div>
                              Processed: {formatDate(leave.approved_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a1 1 0 011-1h30a1 1 0 011 1v4M8 7h32M8 7v32a2 2 0 002 2h28a2 2 0 002-2V7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No leave records found
            </h3>
            <p className="text-gray-500">
              No leave requests match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveDatesStatus;
