const { Op } = require("sequelize");
const sequelize = require("../db/db");
const Timesheet = require("../models/Timesheet");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Create timesheet entry
const createTimesheet = async (req, res) => {
  try {
    console.log("Creating timesheet with data:", req.body); // DEBUG LOG

    const {
      employee_id,
      date,
      clock_in,
      clock_out,
      break_hours,
      work_hours_type,
      attendance_status,
      notes,
    } = req.body;

    // Validation
    if (!employee_id || !date) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and date are required",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (clock_in && !timeRegex.test(clock_in)) {
      return res.status(400).json({
        success: false,
        message: "Invalid clock in time format. Use HH:MM",
      });
    }

    if (clock_out && !timeRegex.test(clock_out)) {
      return res.status(400).json({
        success: false,
        message: "Invalid clock out time format. Use HH:MM",
      });
    }

    // Create using Sequelize
    const timesheet = await Timesheet.create({
      employee_id,
      date,
      clock_in,
      clock_out,
      break_hours: break_hours || 0,
      work_hours_type: work_hours_type || "Regular Hours",
      attendance_status: attendance_status || "Present",
      notes,
    });

    console.log("Timesheet created successfully:", timesheet.toJSON()); // DEBUG LOG

    res.status(201).json({
      success: true,
      data: timesheet,
      message: "Timesheet entry created successfully",
    });
  } catch (error) {
    console.error("Error in createTimesheet:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Timesheet entry already exists for this employee and date",
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get timesheet records
const getTimesheets = async (req, res) => {
  try {
    console.log("Fetching timesheets with query:", req.query); // DEBUG LOG

    const { employee_id, start_date, end_date, attendance_status, department } =
      req.query;

    let result;

    if (employee_id && start_date && end_date) {
      // Get specific employee's timesheet for date range
      result = await Timesheet.getByEmployeeAndDateRange(
        employee_id,
        start_date,
        end_date
      );
    } else {
      // Get all timesheets with filters
      const filters = {};
      if (employee_id) filters.employee_id = employee_id;
      if (start_date && end_date) {
        filters.start_date = start_date;
        filters.end_date = end_date;
      }
      if (attendance_status) filters.attendance_status = attendance_status;
      if (department) filters.department = department;

      result = await Timesheet.getAllWithEmployeeInfo(filters);
    }

    console.log("Timesheet query result:", result); // DEBUG LOG

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in getTimesheets:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update timesheet entry
const updateTimesheet = async (req, res) => {
  try {
    console.log(
      "Updating timesheet ID:",
      req.params.id,
      "with data:",
      req.body
    ); // DEBUG LOG

    const { id } = req.params;
    const {
      clock_in,
      clock_out,
      break_hours,
      work_hours_type,
      attendance_status,
      notes,
    } = req.body;

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (clock_in && !timeRegex.test(clock_in)) {
      return res.status(400).json({
        success: false,
        message: "Invalid clock in time format. Use HH:MM",
      });
    }

    if (clock_out && !timeRegex.test(clock_out)) {
      return res.status(400).json({
        success: false,
        message: "Invalid clock out time format. Use HH:MM",
      });
    }

    // Find the timesheet entry
    const timesheet = await Timesheet.findByPk(id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet entry not found",
      });
    }

    // Update the entry
    await timesheet.update({
      clock_in,
      clock_out,
      break_hours: break_hours || timesheet.break_hours,
      work_hours_type: work_hours_type || timesheet.work_hours_type,
      attendance_status: attendance_status || timesheet.attendance_status,
      notes,
    });

    console.log("Timesheet updated successfully:", timesheet.toJSON()); // DEBUG LOG

    res.json({
      success: true,
      data: timesheet,
      message: "Timesheet entry updated successfully",
    });
  } catch (error) {
    console.error("Error in updateTimesheet:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete timesheet entry
const deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findByPk(id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet entry not found",
      });
    }

    await timesheet.destroy();

    res.json({
      success: true,
      message: "Timesheet entry deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTimesheet:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get timesheet statistics
const getTimesheetStats = async (req, res) => {
  try {
    console.log("Fetching timesheet stats with query:", req.query); // DEBUG LOG

    const { employee_id, start_date, end_date } = req.query;

    const result = await Timesheet.getStats(employee_id, start_date, end_date);

    console.log("Stats result:", result); // DEBUG LOG

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in getTimesheetStats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// REST OF THE LEAVE FUNCTIONS REMAIN THE SAME...
const createLeaveRequest = async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason, remarks } =
      req.body;

    console.log("Creating leave request with data:", req.body); // DEBUG

    if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID, leave type, start date, end date, and reason are required",
      });
    }

    // Verify employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Calculate days requested
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days_requested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    console.log(`Calculated days_requested: ${days_requested}`); // DEBUG

    const leave = await Leave.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      days_requested, // ADD THIS LINE
      reason,
      remarks: remarks || null,
    });

    console.log("Leave created successfully:", leave.id); // DEBUG

    res.status(201).json({
      success: true,
      data: leave,
      message: "Leave request submitted successfully",
    });
  } catch (error) {
    console.error("Error in createLeaveRequest:", error);
    console.error("Error details:", error.message); // MORE DEBUG
    console.error("Error stack:", error.stack); // FULL ERROR

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getLeaveRequests = async (req, res) => {
  try {
    const { employee_id, leave_status, leave_type, department, year } =
      req.query;

    let whereClause = {};
    let employeeWhere = {};

    if (employee_id) whereClause.employee_id = employee_id;
    if (leave_status) whereClause.leave_status = leave_status;
    if (leave_type) whereClause.leave_type = leave_type;
    if (department) employeeWhere.department = department;
    if (year) {
      whereClause.start_date = {
        [Sequelize.Op.gte]: `${year}-01-01`,
        [Sequelize.Op.lt]: `${parseInt(year) + 1}-01-01`,
      };
    }

    const leaves = await Leave.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "position"],
          where:
            Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("Error in getLeaveRequests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by, remarks } = req.body;

    if (!status || !["Approved", "Rejected", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (Approved, Rejected, or Cancelled)",
      });
    }

    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    await leave.update({
      leave_status: status,
      approved_by,
      remarks,
    });

    res.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Error in updateLeaveStatus:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getLeaveBalance = async (req, res) => {
  try {
    const { employee_id, year } = req.query;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    res.json({
      success: true,
      data: {
        employee_id,
        year: year || new Date().getFullYear(),
        annual_leave: 15,
        sick_leave: 10,
        used_annual: 5,
        used_sick: 2,
        remaining_annual: 10,
        remaining_sick: 8,
      },
    });
  } catch (error) {
    console.error("Error in getLeaveBalance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: {
        leave_status: "Pending",
      },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "position"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("Error in getPendingLeaves:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    await leave.destroy();

    res.json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteLeaveRequest:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTimesheet,
  getTimesheets,
  updateTimesheet,
  deleteTimesheet,
  getTimesheetStats,
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveStatus,
  getLeaveBalance,
  getPendingLeaves,
  deleteLeaveRequest,
};
