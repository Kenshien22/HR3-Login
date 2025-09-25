import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate, NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import WorkHoursLogging from "../components/WorkHoursLogging";
import AttendanceRecords from "../components/AttendanceRecords";
import OvertimeHours from "../components/OvertimeHours";
import LeaveRecords from "../components/LeaveRecords";
import EmployeeShift from "../components/EmployeeShift";
import EmployeeSchedule from "../components/EmployeeSchedule";
import LeaveApproval from "../components/LeaveApproval";
import LeaveBalanceMonitoring from "../components/LeaveBalanceMonitoring";
import LeaveDatesStatus from "../components/LeaveDatesStatus";
import EmployeeClaimsSubmission from "../components/EmployeeClaimsSubmission";
import EmployeeReimbursement from "../components/EmployeeReimbursement";
import TimeAttendanceRecords from "../components/TimeAttendanceRecords";
const AdminDashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [formVisible, setFormVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [timeAttendanceOpen, setTimeAttendanceOpen] = useState(false);
  const [timeAttendanceSubSection, setTimeAttendanceSubSection] =
    useState(null);
  const [shiftScheduleOpen, setShiftScheduleOpen] = useState(false);
  const [shiftSubSection, setShiftSubSection] = useState(null);
  const [timesheetOpen, setTimesheetOpen] = useState(false);
  const [timesheetSubSection, setTimesheetSubSection] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveSubSection, setLeaveSubSection] = useState(null);
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [claimsSubSection, setClaimsSubSection] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    averageSalary: 0,
  });
  const [timesheetStats, setTimesheetStats] = useState({
    totalEntries: 0,
    workHours: 0,
    overtime: 0,
    presentDays: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "", // ADD THIS
    role: "employee", // ADD THIS
    department: "",
    position: "",
    salary: "",
    startDate: "",
    status: "Active",
    notes: "",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  useEffect(() => {
    if (location.state) {
      if (location.state.section) {
        setCurrentSection(location.state.section);

        if (
          location.state.section === "time-attendance" &&
          location.state.subSection
        ) {
          setTimeAttendanceOpen(true);
          setTimeAttendanceSubSection(location.state.subSection);
        }

        if (
          location.state.section === "shift-schedule" &&
          location.state.subSection
        ) {
          setShiftScheduleOpen(true);
          setShiftSubSection(location.state.subSection);
        }

        if (
          location.state.section === "timesheet" &&
          location.state.subSection
        ) {
          setTimesheetOpen(true);
          setTimesheetSubSection(location.state.subSection);
        }

        if (location.state.section === "leave" && location.state.subSection) {
          setLeaveOpen(true);
          setLeaveSubSection(location.state.subSection);
        }

        if (location.state.section === "claims" && location.state.subSection) {
          setClaimsOpen(true);
          setClaimsSubSection(location.state.subSection);
        }
      }

      // Clear state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
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

  // Fetch employees from database
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
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
      }
    }
  };

  // Fetch employee statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/employees/stats",
        getAuthHeaders()
      );

      if (response.data.success) {
        const summary = response.data.data.summary;
        setStats({
          totalEmployees: summary.totalEmployees,
          activeEmployees: summary.activeEmployees,
          averageSalary: summary.averageSalary,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  const fetchTimesheetStats = async () => {
    console.log("Calling fetchTimesheetStats...");
    try {
      const response = await axios.get(
        "http://localhost:3000/api/timesheet/stats",
        getAuthHeaders()
      );
      console.log("Timesheet stats response:", response.data);
      if (response.data.success) {
        const data = response.data.data;
        setTimesheetStats({
          totalEntries: data.total_entries || 0, // snake_case
          workHours: data.total_work_hours || 0, // snake_case
          overtime: data.total_overtime_hours || 0, // snake_case
          presentDays: data.present_days || 0, // snake_case
        });
      }
    } catch (error) {
      console.error("Error fetching timesheet stats:", error);
    }
  };
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (user) {
      fetchEmployees();
      fetchStats();
      fetchTimesheetStats();
      const handleRefreshStats = () => {
        fetchStats();
        fetchTimesheetStats();
      };
      window.refreshAdminStats = () => {
        fetchStats();
        fetchTimesheetStats();
      };
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

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

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");

    if (window.confirm("Are you sure you want to logout?")) {
      const success = logout();
      if (success) {
        alert("Logging out... You will be redirected to login page.");
        navigate("/login");
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleForm = () => {
    setFormVisible(!formVisible);
    if (formVisible) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      department: "",
      password: "",
      role: "employee",
      position: "",
      salary: "",
      startDate: "",
      status: "Active",
      notes: "",
      phoneNumber: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
    });
    setEditingEmployee(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.department ||
      !formData.position ||
      !formData.salary ||
      !formData.startDate ||
      (!editingEmployee && !formData.password)
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingEmployee) {
        const response = await axios.put(
          `http://localhost:3000/api/employees/${editingEmployee.id}`,
          formData,
          getAuthHeaders()
        );

        if (response.data.success) {
          alert("Employee updated successfully!");
          fetchEmployees();
          fetchStats();
          resetForm();
          setFormVisible(false);
        }
      } else {
        const response = await axios.post(
          "http://localhost:3000/api/employees",
          formData,
          getAuthHeaders()
        );

        if (response.data.success) {
          alert("Employee added successfully!");
          fetchEmployees();
          fetchStats();
          resetForm();
          setFormVisible(false);
        }
      }
    } catch (error) {
      console.error("Error saving employee:", error);

      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to save employee. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      fullName: employee.fullName,
      email: employee.email,

      password: "",
      role: employee.role || "employee",
      department: employee.department,
      position: employee.position,
      salary: employee.salary.toString(),
      startDate: employee.startDate,
      status: employee.status,
      notes: employee.notes || "",
      phoneNumber: employee.phoneNumber || "",
      address: employee.address || "",
      emergencyContact: employee.emergencyContact || "",
      emergencyPhone: employee.emergencyPhone || "",
    });
    setEditingEmployee(employee);
    setFormVisible(true);
  };

  const handleDelete = async (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      try {
        const response = await axios.delete(
          `http://localhost:3000/api/employees/${id}`,
          getAuthHeaders()
        );

        if (response.data.success) {
          alert("Employee deleted successfully!");
          fetchEmployees();
          fetchStats();
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "Inactive":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
      case "On Leave":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchTerm === "" ||
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employeeId &&
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div
      className={`flex h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } ${sidebarOpen ? "" : "overflow-hidden"}`}
    >
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 text-white w-64 flex-shrink-0 ${
          darkMode ? "bg-gray-950" : "bg-gray-800"
        } ${sidebarOpen ? "ml-0" : "-ml-64"} flex flex-col h-screen`}
      >
        {/* Logo Section - Fixed at top */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/src/assets/logo.png"
              alt="SLATE Logo"
              className="h-12 w-auto"
            />
          </div>
          <div className="text-center text-teal-400 font-bold mb-6 pb-4 border-b border-gray-700">
            (HUMAN RESOURCES 3)
          </div>
        </div>

        {/* Navigation Section - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentSection("dashboard")}
              className={
                currentSection === "dashboard"
                  ? "block py-2 px-4 rounded bg-teal-600 text-white w-full text-left"
                  : "block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors w-full text-left"
              }
            >
              Dashboard
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setTimeAttendanceOpen(!timeAttendanceOpen);
                  setCurrentSection("time-attendance");
                  setTimeAttendanceSubSection("attendance-records");
                  // Reset other modules
                  setTimesheetOpen(false);
                  setTimesheetSubSection(null);
                  setShiftScheduleOpen(false);
                  setLeaveOpen(false);
                  setClaimsOpen(false);
                }}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Time and Attendance</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    timeAttendanceOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {timeAttendanceOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() => {
                      setCurrentSection("time-attendance");
                      setTimeAttendanceSubSection("location-tracking");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      timeAttendanceSubSection === "location-tracking"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Location Based Tracking
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection("time-attendance");
                      setTimeAttendanceSubSection("attendance-records");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      timeAttendanceSubSection === "attendance-records"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Attendance Records
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection("time-attendance");
                      setTimeAttendanceSubSection("overtime-hours");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      timeAttendanceSubSection === "overtime-hours"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Overtime & Extra Hours
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShiftScheduleOpen(!shiftScheduleOpen);
                  setCurrentSection("shift-schedule");
                  setShiftSubSection("employee-schedule");
                  // Reset other modules
                  setTimeAttendanceOpen(false);
                  setTimeAttendanceSubSection(null);
                  setTimesheetOpen(false);
                  setTimesheetSubSection(null);
                  setLeaveOpen(false);
                  setLeaveSubSection(null);
                  setClaimsOpen(false);
                }}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Shift and Schedule</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    shiftScheduleOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {shiftScheduleOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() => {
                      setCurrentSection("shift-schedule");
                      setShiftSubSection("employee-schedule");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      shiftSubSection === "employee-schedule"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Employee Schedule
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection("shift-schedule");
                      setShiftSubSection("employee-shift");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      shiftSubSection === "employee-shift"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Employee Shift
                  </button>
                </div>
              )}
            </div>

            {/* Timesheet Dropdown - RESTRUCTURED */}
            <div className="relative">
              <button
                onClick={() => {
                  setTimesheetOpen(!timesheetOpen);
                  setCurrentSection("timesheet");
                  setTimesheetSubSection("attendance-records");
                  // Reset other modules when opening
                  if (!timesheetOpen) {
                    setTimeAttendanceOpen(false);
                    setTimeAttendanceSubSection(null);
                    setShiftScheduleOpen(false);
                    setShiftSubSection(null);
                    setLeaveOpen(false);
                    setLeaveSubSection(null);
                    setClaimsOpen(false);
                  }
                }}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Timesheet</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    timesheetOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {timesheetOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() => {
                      setCurrentSection("timesheet");
                      setTimesheetSubSection("attendance-records");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      timesheetSubSection === "attendance-records"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Attendance Records
                  </button>

                  <button
                    onClick={() => {
                      setCurrentSection("timesheet");
                      setTimesheetSubSection("work-hours");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      timesheetSubSection === "work-hours"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Work Hours Logging
                  </button>

                  <button
                    onClick={() => {
                      setCurrentSection("timesheet");
                      setTimesheetSubSection("leave-records");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      timesheetSubSection === "leave-records"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Leave Records
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setLeaveOpen(!leaveOpen);
                  setCurrentSection("leave");
                  setLeaveSubSection("leave-approval");
                  // Reset other modules      setCurrentSection("timesheet");

                  setTimeAttendanceOpen(false);
                  setTimeAttendanceSubSection(null);
                  setTimesheetOpen(false);
                  setTimesheetSubSection(null);
                  setShiftScheduleOpen(false);
                  setClaimsOpen(false);
                }}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Leave</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    leaveOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {leaveOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() => {
                      setCurrentSection("leave");
                      setLeaveSubSection("leave-approval");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      leaveSubSection === "leave-approval"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Leave Approval
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection("leave");
                      setLeaveSubSection("leave-balance");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      leaveSubSection === "leave-balance"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Leave Balance Monitoring
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection("leave");
                      setLeaveSubSection("leave-dates");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      leaveSubSection === "leave-dates"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Leave Dates and Status
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setClaimsOpen(!claimsOpen);
                  setCurrentSection("claims");
                  setClaimsSubSection("claims-submission"); // Set default
                  // Reset other modules
                  setTimeAttendanceOpen(false);
                  setTimeAttendanceSubSection(null);
                  setTimesheetOpen(false);
                  setTimesheetSubSection(null);
                  setShiftScheduleOpen(false);
                  setShiftSubSection(null);
                  setLeaveOpen(false);
                  setLeaveSubSection(null);
                }}
                className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              >
                <span>Claims&Reimbursement</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    claimsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {claimsOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                  <button
                    onClick={() => {
                      setCurrentSection("claims");
                      setClaimsSubSection("claims-submission");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      claimsSubSection === "claims-submission"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Employee Claims Submission
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection("claims");
                      setClaimsSubSection("reimbursement");
                    }}
                    className={`block py-1 px-3 text-sm hover:text-white cursor-pointer w-full text-left ${
                      claimsSubSection === "reimbursement"
                        ? "text-teal-400"
                        : "text-gray-300"
                    }`}
                  >
                    Employee Reimbursement
                  </button>
                </div>
              )}
            </div>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive
                  ? "block py-2 px-4 rounded bg-teal-600 text-white"
                  : "block py-2 px-4 rounded hover:bg-gray-700 text-white transition-colors"
              }
            >
              System Settings
            </NavLink>

            <button
              onClick={handleLogout}
              className="block py-2 px-4 rounded hover:bg-gray-700 w-full text-left"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto transition-all duration-300">
        {/* Header */}
        <header
          className={`shadow-sm p-4 flex justify-between items-center border-b transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className={`mr-4 p-2 rounded-full transition-colors ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              ☰
            </button>
            <div>
              <h1
                className={`text-xl font-semibold transition-colors ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Admin Dashboard
                <span className="text-teal-500 ml-2 text-sm">
                  | (HUMAN RESOURCES 3)
                </span>
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Welcome, {user?.name || user?.email || "User"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span
              className={`text-sm mr-2 transition-colors ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Dark Mode
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div
                className={`w-14 h-7 rounded-full peer focus:outline-none transition-all after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${
                  darkMode
                    ? "bg-teal-600 after:translate-x-7 after:border-white"
                    : "bg-gray-300 after:border-gray-300"
                }`}
              ></div>
            </label>
          </div>
        </header>

        {/* Conditional Content Rendering */}
        {currentSection === "dashboard" && (
          <div className="p-6">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-transform hover:translate-y-[-5px] hover:shadow-lg">
                <h3 className="text-blue-500 dark:text-blue-400 mb-4">
                  Total Employees
                </h3>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {stats.totalEmployees}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {stats.totalEmployees === 0
                    ? "No employees yet"
                    : "Employees registered"}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-transform hover:translate-y-[-5px] hover:shadow-lg">
                <h3 className="text-blue-500 dark:text-blue-400 mb-4">
                  Active Employees
                </h3>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {stats.activeEmployees}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {stats.activeEmployees === 0
                    ? "No active employees"
                    : "Currently active"}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-transform hover:translate-y-[-5px] hover:shadow-lg">
                <h3 className="text-blue-500 dark:text-blue-400 mb-4">
                  Average Salary
                </h3>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  $
                  {stats.averageSalary.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {stats.totalEmployees === 0
                    ? "No salary data"
                    : "Average compensation"}
                </div>
              </div>
            </div>
            {/* TIMESHEET CARDS - IDAGDAG MO TO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-green-500 dark:text-green-400 mb-4">
                  Total Entries
                </h3>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {timesheetStats.totalEntries}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Timesheet entries
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-purple-500 dark:text-purple-400 mb-4">
                  Work Hours
                </h3>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {timesheetStats.workHours}h
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Total hours worked
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-orange-500 dark:text-orange-400 mb-4">
                  Overtime
                </h3>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {timesheetStats.overtime}h
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Overtime hours
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-teal-500 dark:text-teal-400 mb-4">
                  Present Days
                </h3>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {timesheetStats.presentDays}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Days present
                </div>
              </div>
            </div>
            {/* Search and Filter Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Departments</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">Information Technology</option>
                    <option value="Operations">Operations</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Add Employee Button */}
            <button
              onClick={toggleForm}
              className="mb-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {formVisible ? "Cancel" : "Add New Employee"}
            </button>

            {/* Employee Form */}
            {formVisible && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-blue-500 dark:text-blue-400 text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
                      Basic Information
                    </h4>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required={!editingEmployee} // Required only for new employees
                        placeholder={
                          editingEmployee
                            ? "Leave blank to keep current password"
                            : "Enter password"
                        }
                      />
                      {!editingEmployee && (
                        <p className="text-xs text-gray-500 mt-1">
                          Employee will use their Full Name and this password to
                          login
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Admin: Full system access | Employee: Limited access
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        placeholder="+63 9XX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Complete address"
                      ></textarea>
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
                      Work Information
                    </h4>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="HR">Human Resources</option>
                        <option value="Finance">Finance</option>
                        <option value="IT">Information Technology</option>
                        <option value="Operations">Operations</option>
                        <option value="Logistics">Logistics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Position *
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                        placeholder="Job title"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Salary (USD) *
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                        min="0"
                        step="0.01"
                        placeholder="50000.00"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Notes - Full Width */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
                    Emergency Contact & Additional Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Contact person name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                        placeholder="+63 9XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Additional notes about the employee..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors disabled:bg-gray-400"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : editingEmployee
                        ? "Update Employee"
                        : "Save Employee"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Employee Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-blue-500 dark:text-blue-400 text-xl font-semibold">
                  Employee Management
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredEmployees.length} of {employees.length} employees
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                        Employee ID
                      </th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                        Name
                      </th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                        Email
                      </th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                        Department
                      </th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                        Position
                      </th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                        Salary
                      </th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-400">
                        Start Date
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
                    {filteredEmployees.length === 0 ? (
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td
                          colSpan="9"
                          className="p-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          {employees.length === 0
                            ? "No employees found. Add your first employee to get started."
                            : "No employees match your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="p-3 text-gray-800 dark:text-white">
                            {employee.employeeId ||
                              `EMP${String(employee.id).padStart(4, "0")}`}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-white">
                            {employee.fullName}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-white">
                            {employee.email}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-white">
                            {employee.department}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-white">
                            {employee.position}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-white">
                            ${parseFloat(employee.salary).toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-white">
                            {new Date(employee.startDate).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                employee.status
                              )}`}
                            >
                              {employee.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(employee)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(employee.id, employee.fullName)
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

              {/* Employee Count Summary */}
              {filteredEmployees.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Showing {filteredEmployees.length} employee
                      {filteredEmployees.length !== 1 ? "s" : ""}
                    </span>
                    <span>
                      Total Salary: $
                      {filteredEmployees
                        .reduce((sum, emp) => sum + parseFloat(emp.salary), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {currentSection === "time-attendance" && (
          <div className="p-6">
            {/* Back Button */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => {
                  setCurrentSection("dashboard");
                  setTimeAttendanceSubSection(null);
                }}
                className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <span className="mx-3 text-gray-400">|</span>
              <nav className="text-sm text-gray-600 dark:text-gray-400">
                <span>Dashboard</span>
                <span className="mx-2">›</span>
                <span>Time and Attendance</span>
                <span className="mx-2">›</span>
                <span className="text-gray-800 dark:text-white">
                  {timeAttendanceSubSection === "attendance-records" &&
                    "Attendance Records"}
                  {timeAttendanceSubSection === "overtime-hours" &&
                    "Overtime & Extra Hours"}
                  {timeAttendanceSubSection === "location-tracking" &&
                    "Location Based Tracking"}
                </span>
              </nav>
            </div>

            {/* Content Header */}
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {timeAttendanceSubSection === "attendance-records" &&
                "Attendance Records"}
              {timeAttendanceSubSection === "overtime-hours" &&
                "Overtime & Extra Hours"}
              {timeAttendanceSubSection === "location-tracking" &&
                "Location Based Tracking"}
            </div>

            {/* Content Rendering */}
            {timeAttendanceSubSection === "attendance-records" && (
              <TimeAttendanceRecords />
            )}
            {timeAttendanceSubSection === "overtime-hours" && <OvertimeHours />}
            {timeAttendanceSubSection === "location-tracking" && (
              <div className="text-gray-600 dark:text-gray-400">
                Location Based Tracking - Coming Soon (Azure Maps Integration)
              </div>
            )}
          </div>
        )}
        {currentSection === "timesheet" && (
          <div className="p-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => {
                  setCurrentSection("dashboard");
                  setTimesheetSubSection(null);
                }}
                className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <span className="mx-3 text-gray-400">|</span>
              <nav className="text-sm text-gray-600 dark:text-gray-400">
                <span>Dashboard</span>
                <span className="mx-2">›</span>
                <span>Timesheet</span>
                <span className="mx-2">›</span>
                <span className="text-gray-800 dark:text-white">
                  {timesheetSubSection === "attendance-records" &&
                    "Attendance Records"}
                  {timesheetSubSection === "work-hours" && "Work Hours Logging"}
                  {timesheetSubSection === "leave-records" && "Leave Records"}
                </span>
              </nav>
            </div>

            {/* Content Header */}
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {timesheetSubSection === "attendance-records" &&
                "Employee Attendance Records"}
              {timesheetSubSection === "work-hours" &&
                "Employee Work Hours Logging"}
              {timesheetSubSection === "leave-records" &&
                "Employee Leave Records"}
            </div>

            {/* Sub-module Components */}
            {timesheetSubSection === "attendance-records" && (
              <AttendanceRecords />
            )}
            {timesheetSubSection === "work-hours" && <WorkHoursLogging />}
            {timesheetSubSection === "leave-records" && <LeaveRecords />}
          </div>
        )}
        {currentSection === "shift-schedule" && (
          <div className="p-6">
            {/* Back Button */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => {
                  setCurrentSection("dashboard");
                  setShiftSubSection(null);
                }}
                className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <span className="mx-3 text-gray-400">|</span>
              <nav className="text-sm text-gray-600 dark:text-gray-400">
                <span>Dashboard</span>
                <span className="mx-2">›</span>
                <span>Shift and Schedule</span>
                <span className="mx-2">›</span>
                <span className="text-gray-800 dark:text-white">
                  {shiftSubSection === "employee-schedule" &&
                    "Employee Schedule"}
                  {shiftSubSection === "employee-shift" && "Employee Shift"}
                </span>
              </nav>
            </div>

            {/* Content Header */}
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {shiftSubSection === "employee-schedule" &&
                "Employee Schedule Management"}
              {shiftSubSection === "employee-shift" &&
                "Employee Shift Management"}
            </div>

            {/* Content Rendering */}
            {shiftSubSection === "employee-schedule" && <EmployeeSchedule />}
            {shiftSubSection === "employee-shift" && <EmployeeShift />}
          </div>
        )}
        {currentSection === "leave" && (
          <div className="p-6">
            {/* Back Button */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => {
                  setCurrentSection("dashboard");
                  setLeaveSubSection(null);
                }}
                className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <span className="mx-3 text-gray-400">|</span>
              <nav className="text-sm text-gray-600 dark:text-gray-400">
                <span>Dashboard</span>
                <span className="mx-2">›</span>
                <span>Leave Management</span>
                <span className="mx-2">›</span>
                <span className="text-gray-800 dark:text-white">
                  {leaveSubSection === "leave-approval" && "Leave Approval"}
                  {leaveSubSection === "leave-balance" &&
                    "Leave Balance Monitoring"}
                  {leaveSubSection === "leave-dates" &&
                    "Leave Dates and Status"}
                </span>
              </nav>
            </div>

            {/* Content Header */}
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {leaveSubSection === "leave-approval" &&
                "Leave Approval Management"}
              {leaveSubSection === "leave-balance" &&
                "Leave Balance Monitoring"}
              {leaveSubSection === "leave-dates" &&
                "Leave Dates and Status Tracking"}
            </div>

            {/* Content Rendering */}
            {leaveSubSection === "leave-approval" && <LeaveApproval />}
            {leaveSubSection === "leave-balance" && <LeaveBalanceMonitoring />}
            {leaveSubSection === "leave-dates" && <LeaveDatesStatus />}
          </div>
        )}
        {currentSection === "claims" && (
          <div className="p-6">
            {/* Back Button */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => {
                  setCurrentSection("dashboard");
                  setClaimsSubSection(null);
                }}
                className="flex items-center text-blue-500 hover:text-blue-600 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <span className="mx-3 text-gray-400">|</span>
              <nav className="text-sm text-gray-600 dark:text-gray-400">
                <span>Dashboard</span>
                <span className="mx-2">›</span>
                <span>Claims & Reimbursement</span>
                <span className="mx-2">›</span>
                <span className="text-gray-800 dark:text-white">
                  {claimsSubSection === "claims-submission" &&
                    "Employee Claims Submission"}
                  {claimsSubSection === "reimbursement" &&
                    "Employee Reimbursement"}
                </span>
              </nav>
            </div>

            {/* Content Header */}
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {claimsSubSection === "claims-submission" &&
                "Employee Claims Submission Management"}
              {claimsSubSection === "reimbursement" &&
                "Employee Reimbursement Processing"}
            </div>

            {/* Content Rendering */}
            {claimsSubSection === "claims-submission" && (
              <EmployeeClaimsSubmission />
            )}
            {claimsSubSection === "reimbursement" && <EmployeeReimbursement />}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
