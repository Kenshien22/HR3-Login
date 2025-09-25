const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { Op } = require("sequelize");
const EmployeeSchedule = require("../models/EmployeeSchedule");
const Shift = require("../models/Shift");

const clockIn = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const employee = await Employee.findOne({
      where: { email: userEmail },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const today = new Date();
    const dateOnly = today.toISOString().split("T")[0];

    // Check if already clocked in
    const existingAttendance = await Attendance.findOne({
      where: {
        employeeId: employee.id,
        date: dateOnly,
      },
    });

    if (existingAttendance && existingAttendance.clockIn) {
      return res.status(400).json({
        success: false,
        message: "Already clocked in today",
      });
    }

    // CHECK EMPLOYEE SCHEDULE
    let status = "present";
    let lateMinutes = 0;
    let scheduledInTime = null;

    console.log("Looking for schedule:", {
      employee_id: employee.id,
      date: dateOnly,
    });

    const schedule = await EmployeeSchedule.findOne({
      where: {
        employee_id: employee.id,
        schedule_date: dateOnly,
      },
      include: [
        {
          model: Shift,
          foreignKey: "shift_id",
        },
      ],
    });

    console.log("Found schedule:", schedule ? "YES" : "NO");
    if (schedule) {
      console.log("Schedule details:", {
        shift_id: schedule.shift_id,
        status: schedule.status,
      });
      console.log("Shift data:", schedule.Shift);
    }

    if (schedule && schedule.Shift) {
      scheduledInTime = schedule.Shift.start_time;

      // Parse scheduled time (format: "08:00:00" or "08:00")
      const [schedHour, schedMin] = scheduledInTime.split(":").map(Number);
      const currentHour = today.getHours();
      const currentMin = today.getMinutes();

      // Calculate if late
      const scheduledMinutes = schedHour * 60 + schedMin;
      const actualMinutes = currentHour * 60 + currentMin;

      if (actualMinutes > scheduledMinutes) {
        lateMinutes = actualMinutes - scheduledMinutes;
        status = "late";
        console.log(
          `Employee ${employee.fullName} is LATE by ${lateMinutes} minutes`
        );
      }
    } else {
      console.log(`No schedule found for ${employee.fullName} today`);
    }

    // Create attendance record
    const attendanceData = {
      employeeId: employee.id,
      date: dateOnly,
      clockIn: today,
      status: status,
      lateMinutes: lateMinutes,
      scheduledIn: scheduledInTime,
      notes: lateMinutes > 0 ? `Late by ${lateMinutes} minutes` : null,
    };

    if (existingAttendance) {
      await existingAttendance.update(attendanceData);
    } else {
      await Attendance.create(attendanceData);
    }

    res.json({
      success: true,
      message:
        lateMinutes > 0
          ? `Clocked in (LATE by ${lateMinutes} minutes)`
          : "Clocked in successfully on time!",
      time: today,
      status: status,
      lateMinutes: lateMinutes,
    });
  } catch (error) {
    console.error("Clock in error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clock in",
      error: error.message,
    });
  }
};

// Clock Out
const clockOut = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const employee = await Employee.findOne({
      where: { email: userEmail },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      where: {
        employeeId: employee.id,
        date: today,
      },
    });

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({
        success: false,
        message: "Haven't clocked in today",
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        success: false,
        message: "Already clocked out today",
      });
    }

    // Calculate work hours
    const clockInTime = new Date(attendance.clockIn);
    const clockOutTime = new Date();
    const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

    // Update attendance with clock out and hours
    attendance.clockOut = clockOutTime;
    attendance.workHours = parseFloat(hoursWorked.toFixed(2));

    // Calculate overtime (if > 8 hours)
    if (hoursWorked > 8) {
      attendance.overtimeHours = parseFloat((hoursWorked - 8).toFixed(2));
    } else {
      attendance.overtimeHours = 0;
    }

    await attendance.save();

    // CREATE TIMESHEET ENTRY
    try {
      const Timesheet = require("../models/Timesheet");

      // Format times for timesheet (HH:MM:SS format)
      const clockInTimeString = clockInTime.toTimeString().split(" ")[0];
      const clockOutTimeString = clockOutTime.toTimeString().split(" ")[0];

      console.log("Clock times to save:", {
        clockIn: clockInTimeString,
        clockOut: clockOutTimeString,
      });
      const existingTimesheet = await Timesheet.findOne({
        where: {
          employee_id: employee.id,
          date: attendance.date,
        },
      });

      const timesheetData = {
        employee_id: employee.id,
        date: attendance.date,
        clock_in: clockInTimeString,
        clock_out: clockOutTimeString,
        total_hours: attendance.workHours,
        overtime_hours: attendance.overtimeHours || 0,
        attendance_status: attendance.status === "late" ? "Late" : "Present", // THIS IS THE FIX
        work_hours_type:
          attendance.overtimeHours > 0 ? "Overtime" : "Regular Hours",
      };

      if (existingTimesheet) {
        await existingTimesheet.update(timesheetData);
        console.log("Timesheet updated for:", employee.fullName);
      } else {
        await Timesheet.create(timesheetData);
        console.log("Timesheet created for:", employee.fullName);
      }
    } catch (timesheetError) {
      console.error("Timesheet error:", timesheetError.message);
    }

    res.json({
      success: true,
      message: "Clocked out successfully",
      time: clockOutTime,
      workHours: attendance.workHours,
    });
  } catch (error) {
    console.error("Clock out error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clock out",
    });
  }
};

// Get attendance status
const getAttendanceStatus = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const employee = await Employee.findOne({
      where: { email: userEmail },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      where: {
        employeeId: employee.id,
        date: today,
      },
    });

    res.json({
      success: true,
      data: {
        clockedIn: attendance?.clockIn ? true : false,
        clockedOut: attendance?.clockOut ? true : false,
        clockInTime: attendance?.clockIn,
        clockOutTime: attendance?.clockOut,
        workHours: attendance?.workHours || 0,
      },
    });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance status",
    });
  }
};

// Get my attendance records
const getMyAttendance = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const employee = await Employee.findOne({
      where: { email: userEmail },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const attendance = await Attendance.findAll({
      where: { employeeId: employee.id },
      order: [["date", "DESC"]],
      limit: 30, // Last 30 days
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance records",
    });
  }
};
// Get recent late arrivals (for admin)
const getRecentLateArrivals = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lateArrivals = await Attendance.findAll({
      where: {
        status: "late",
        date: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      include: [
        {
          model: Employee,
          attributes: ["fullName", "department", "position"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["clockIn", "DESC"],
      ],
      limit: 20,
    });

    res.json({
      success: true,
      data: lateArrivals,
    });
  } catch (error) {
    console.error("Get late arrivals error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get late arrivals",
    });
  }
};
// Get all attendance records (for admin)
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      include: [
        {
          model: Employee,
          attributes: ["fullName", "department", "position", "employeeId"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["clockIn", "DESC"],
      ],
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance records",
    });
  }
};

// Add to exports
module.exports = {
  clockIn,
  clockOut,
  getAttendanceStatus,
  getMyAttendance,
  getRecentLateArrivals,
  getAllAttendance, // ADD THIS
};
