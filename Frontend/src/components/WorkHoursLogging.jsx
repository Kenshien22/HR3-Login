import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WorkHoursLogging = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [darkMode, setDarkMode] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      start: firstDay.toISOString().split("T")[0],
      end: lastDay.toISOString().split("T")[0],
    };
  });
  const [filters, setFilters] = useState({
    attendance_status: "all",
    department: "all",
  });
  const [stats, setStats] = useState({
    total_entries: 0,
    total_work_hours: 0,
    total_overtime_hours: 0,
    present_days: 0,
    absent_days: 0,
    late_days: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    clock_in: "",
    clock_out: "",
    break_hours: 1,
    work_hours_type: "Regular Hours",
    attendance_status: "Present",
    notes: "",
  });

  // API helper function
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/employees",
        getAuthHeaders()
      );
      if (response.data.success) {
        setEmployees(response.data.data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch   records
  const fetchTimesheets = async () => {
    try {
      const params = new URLSearchParams();

      if (selectedEmployee) params.append("employee_id", selectedEmployee);
      params.append("start_date", dateRange.start);
      params.append("end_date", dateRange.end);
      if (filters.attendance_status !== "all")
        params.append("attendance_status", filters.attendance_status);
      if (filters.department !== "all")
        params.append("department", filters.department);

      const response = await axios.get(
        `http://localhost:3000/api/timesheet?${params.toString()}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setTimesheets(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    }
  };

  // Fetch timesheet stats
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEmployee) params.append("employee_id", selectedEmployee);
      params.append("start_date", dateRange.start);
      params.append("end_date", dateRange.end);

      const response = await axios.get(
        `http://localhost:3000/api/timesheet/stats?${params.toString()}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (user) {
      fetchEmployees();
      fetchTimesheets();
      fetchStats();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchTimesheets();
    fetchStats();
  }, [selectedEmployee, dateRange, filters]);

  // Add this new function after handleInputChange
  const checkIfLate = (clockInTime) => {
    if (clockInTime) {
      const [hours, minutes] = clockInTime.split(":").map(Number);
      const clockInMinutes = hours * 60 + minutes;
      const nineAM = 9 * 60; // 9:00 AM in minutes

      if (clockInMinutes > nineAM) {
        setFormData((prev) => ({
          ...prev,
          attendance_status: "Late",
        }));
        // Optional: Show a hint
        alert("Clock in time is after 9:00 AM - Status set to Late");
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingEntry) {
        // Update existing entry
        const response = await axios.put(
          `http://localhost:3000/api/timesheet/${editingEntry.id}`,
          formData,
          getAuthHeaders()
        );

        if (response.data.success) {
          alert("Timesheet updated successfully!");
        }
      } else {
        // Create new entry
        const response = await axios.post(
          "http://localhost:3000/api/timesheet",
          formData,
          getAuthHeaders()
        );

        if (response.data.success) {
          alert("Timesheet entry created successfully!");
        }
      }

      resetForm();
      fetchTimesheets();
      fetchStats();
      if (window.refreshAdminStats) {
        window.refreshAdminStats();
      }
    } catch (error) {
      console.error("Error saving timesheet:", error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to save timesheet entry");
      }
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      employee_id: entry.employee_id,
      date: entry.date,
      clock_in: entry.clock_in || "",
      clock_out: entry.clock_out || "",
      break_hours: entry.break_hours || 1,
      work_hours_type: entry.work_hours_type,
      attendance_status: entry.attendance_status,
      notes: entry.notes || "",
    });
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (id, employeeName, date) => {
    if (
      window.confirm(`Delete timesheet entry for ${employeeName} on ${date}?`)
    ) {
      try {
        const response = await axios.delete(
          `http://localhost:3000/api/timesheet/${id}`,
          getAuthHeaders()
        );

        if (response.data.success) {
          alert("Timesheet entry deleted successfully!");
          fetchTimesheets();
          fetchStats();
        }
        const event = new CustomEvent("refreshStats");
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error deleting timesheet:", error);
        alert("Failed to delete timesheet entry");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      date: new Date().toISOString().split("T")[0],
      clock_in: "",
      clock_out: "",
      break_hours: 1,
      work_hours_type: "Regular Hours",
      attendance_status: "Present",
      notes: "",
    });
    setEditingEntry(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "Absent":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
      case "Late":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
      case "Half Day":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900";
      case "On Leave":
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
    }
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
      className={`min-h-screen p-6 transition-all duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-blue-500 dark:text-blue-400 mb-2">
            Total Entries
          </h3>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {stats.total_entries || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-green-500 dark:text-green-400 mb-2">
            Work Hours
          </h3>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {parseFloat(stats.total_work_hours || 0).toFixed(1)}h
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-orange-500 dark:text-orange-400 mb-2">
            Overtime
          </h3>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {parseFloat(stats.total_overtime_hours || 0).toFixed(1)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-purple-500 dark:text-purple-400 mb-2">
            Present Days
          </h3>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {stats.present_days || 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} (
                  {emp.employeeId || `EMP${String(emp.id).padStart(4, "0")}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.attendance_status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  attendance_status: e.target.value,
                }))
              }
              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value }))
              }
              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
            >
              <option value="all">All Departments</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="IT">Information Technology</option>
              <option value="Operations">Operations</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Entry Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
      >
        {showForm ? "Cancel" : "Add Timesheet Entry"}
      </button>

      {/* Timesheet Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {editingEntry ? "Edit Timesheet Entry" : "Add Timesheet Entry"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee *
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} (
                    {emp.employeeId || `EMP${String(emp.id).padStart(4, "0")}`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clock In
              </label>
              <input
                type="time"
                name="clock_in"
                value={formData.clock_in}
                onChange={(e) => {
                  handleInputChange(e);
                  checkIfLate(e.target.value);
                }}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clock Out
              </label>
              <input
                type="time"
                name="clock_out"
                value={formData.clock_out}
                onChange={handleInputChange}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Break Hours
              </label>
              <input
                type="number"
                name="break_hours"
                value={formData.break_hours}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Hours Type
              </label>
              <select
                name="work_hours_type"
                value={formData.work_hours_type}
                onChange={handleInputChange}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
              >
                <option value="Regular Hours">Regular Hours</option>
                <option value="Overtime">Overtime</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Holiday Work">Holiday Work</option>
                <option value="Weekend Work">Weekend Work</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attendance Status
              </label>
              <select
                name="attendance_status"
                value={formData.attendance_status}
                onChange={handleInputChange}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white"
                placeholder="Additional notes..."
              ></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                {editingEntry ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timesheet Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Timesheet Records
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {timesheets.length} entries found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Employee
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Clock In
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Clock Out
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Total Hours
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Overtime
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {timesheets.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No timesheet entries found for the selected criteria.
                  </td>
                </tr>
              ) : (
                timesheets.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-3 text-gray-800 dark:text-white">
                      <div>
                        <div className="font-medium">{entry.employee_name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.department} - {entry.position}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-800 dark:text-white">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-gray-800 dark:text-white">
                      {entry.clock_in || "-"}
                    </td>
                    <td className="p-3 text-gray-800 dark:text-white">
                      {entry.clock_out || "-"}
                    </td>
                    <td className="p-3 text-gray-800 dark:text-white">
                      {entry.total_hours ? `${entry.total_hours}h` : "-"}
                    </td>
                    <td className="p-3 text-gray-800 dark:text-white">
                      {entry.overtime_hours ? `${entry.overtime_hours}h` : "-"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          entry.attendance_status
                        )}`}
                      >
                        {entry.attendance_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              entry.id,
                              entry.employee_name,
                              new Date(entry.date).toLocaleDateString()
                            )
                          }
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
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

export default WorkHoursLogging;
