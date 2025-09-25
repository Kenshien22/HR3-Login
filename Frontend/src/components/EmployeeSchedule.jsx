import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";

const EmployeeSchedule = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  // Get current week dates
  function getCurrentWeek() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split("T")[0];
  }

  // Get week dates array
  function getWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
    loadSchedules();
  }, [selectedWeek]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setEmployees(response.data.data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/shifts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setShifts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      // Fallback to mock shifts if API fails
      setShifts([
        {
          id: 1,
          name: "Morning Shift",
          start_time: "08:00",
          end_time: "17:00",
        },
        {
          id: 2,
          name: "Afternoon Shift",
          start_time: "13:00",
          end_time: "22:00",
        },
        { id: 3, name: "Night Shift", start_time: "22:00", end_time: "06:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const weekDates = getWeekDates(selectedWeek);
      const startDate = weekDates[0];
      const endDate = weekDates[6];

      const response = await axios.get(
        `http://localhost:3000/api/schedules?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Convert API response to frontend format
        const schedulesData = {};
        response.data.data.forEach((schedule) => {
          const key = `${schedule.schedule_date}_${schedule.employee_id}`;
          schedulesData[key] = {
            employeeId: schedule.employee_id,
            shiftId: schedule.shift_id,
            date: schedule.schedule_date,
          };
        });
        setSchedules(schedulesData);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      setSchedules({});
    }
  };

  const assignShift = async (employeeId, date, shiftId) => {
    const key = `${date}_${employeeId}`;

    try {
      const token = localStorage.getItem("token");

      if (shiftId === null) {
        // Remove assignment
        await axios.delete("http://localhost:3000/api/schedules/remove", {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            employee_id: employeeId,
            schedule_date: date,
          },
        });

        const newSchedules = { ...schedules };
        delete newSchedules[key];
        setSchedules(newSchedules);
        showNotification(
          `Schedule removed for ${getEmployeeName(employeeId)} on ${formatDate(
            date
          )}`
        );
      } else {
        // Add/update assignment
        await axios.post(
          "http://localhost:3000/api/schedules/assign",
          {
            employee_id: employeeId,
            shift_id: shiftId,
            schedule_date: date,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSchedules((prev) => ({
          ...prev,
          [key]: { employeeId, shiftId, date },
        }));
        showNotification(
          `${getEmployeeName(employeeId)} assigned to ${getShiftName(
            shiftId
          )} on ${formatDate(date)}`
        );
      }
    } catch (error) {
      console.error("Error assigning shift:", error);
      showNotification("Error saving schedule. Please try again.", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
    notification.className = `fixed top-4 right-4 ${bgColor} text-white p-3 rounded shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.fullName : "Unknown";
  };

  const getShiftName = (shiftId) => {
    const shift = shifts.find((s) => s.id === shiftId);
    return shift ? shift.name : "Unknown";
  };

  const getShiftForEmployee = (employeeId, date) => {
    const key = `${date}_${employeeId}`;
    const schedule = schedules[key];
    return schedule ? shifts.find((s) => s.id === schedule.shiftId) : null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const clearWeek = async () => {
    try {
      const token = localStorage.getItem("token");
      const weekDates = getWeekDates(selectedWeek);

      // Remove all schedules for this week
      for (const date of weekDates) {
        for (const employee of filteredEmployees) {
          const key = `${date}_${employee.id}`;
          if (schedules[key]) {
            await axios.delete("http://localhost:3000/api/schedules/remove", {
              headers: { Authorization: `Bearer ${token}` },
              data: {
                employee_id: employee.id,
                schedule_date: date,
              },
            });
          }
        }
      }

      setSchedules({});
      showNotification("All schedules cleared for this week");
    } catch (error) {
      console.error("Error clearing schedules:", error);
      showNotification("Error clearing schedules. Please try again.", "error");
    }
  };

  const autoAssignWeekdays = async () => {
    try {
      const token = localStorage.getItem("token");
      const weekDates = getWeekDates(selectedWeek);
      const newSchedules = { ...schedules };

      // Auto-assign morning shift to all employees for weekdays
      for (const date of weekDates.slice(0, 5)) {
        // Monday to Friday
        for (const emp of filteredEmployees) {
          await axios.post(
            "http://localhost:3000/api/schedules/assign",
            {
              employee_id: emp.id,
              shift_id: 1, // Morning shift
              schedule_date: date,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          newSchedules[`${date}_${emp.id}`] = {
            employeeId: emp.id,
            shiftId: 1,
            date: date,
          };
        }
      }

      setSchedules(newSchedules);
      showNotification("Morning shift assigned to all employees for weekdays");
    } catch (error) {
      console.error("Error auto-assigning schedules:", error);
      showNotification(
        "Error auto-assigning schedules. Please try again.",
        "error"
      );
    }
  };

  const weekDates = getWeekDates(selectedWeek);
  const filteredEmployees =
    selectedEmployee === "all"
      ? employees
      : employees.filter((emp) => emp.id === parseInt(selectedEmployee));

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
          <h2 className="text-xl font-semibold">Employee Scheduling</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Assign employees to shifts and manage notifications
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Week
            </label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee Filter
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-x-auto">
        <div className="p-4 border-b">
          <h3 className="font-medium">Weekly Schedule</h3>
        </div>

        {/* Calendar Header */}
        <div className="grid grid-cols-8 gap-0 border-b">
          <div className="p-3 font-medium text-center bg-gray-50 dark:bg-gray-700">
            Employee
          </div>
          {weekDates.map((date) => (
            <div
              key={date}
              className="p-3 font-medium text-center bg-gray-50 dark:bg-gray-700"
            >
              {formatDate(date)}
            </div>
          ))}
        </div>

        {/* Employee Rows */}
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="grid grid-cols-8 gap-0 border-b hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="p-3 font-medium border-r">
              <div>{employee.fullName}</div>
              <div className="text-sm text-gray-500">{employee.department}</div>
            </div>

            {weekDates.map((date) => {
              const assignedShift = getShiftForEmployee(employee.id, date);
              return (
                <div key={date} className="p-2 border-r">
                  <select
                    value={assignedShift ? assignedShift.id : ""}
                    onChange={(e) => {
                      const shiftId = e.target.value
                        ? parseInt(e.target.value)
                        : null;
                      assignShift(employee.id, date, shiftId);
                    }}
                    className="w-full p-1 text-xs border rounded dark:bg-gray-700"
                  >
                    <option value="">No Shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name}
                      </option>
                    ))}
                  </select>

                  {assignedShift && (
                    <div className="text-xs text-gray-500 mt-1">
                      {assignedShift.start_time} - {assignedShift.end_time}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No employees found
          </div>
        )}
      </div>

      {/* Shift Legend */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Available Shifts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="font-medium">{shift.name}</div>
              <div className="text-sm text-gray-500">
                {shift.start_time} - {shift.end_time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={clearWeek}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
          >
            Clear Week
          </button>
          <button
            onClick={autoAssignWeekdays}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Auto-Assign Weekdays
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSchedule;
