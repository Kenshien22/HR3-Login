const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/timesheetControllers");

// Import auth middleware
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// ==================== TIMESHEET ROUTES ====================
// IMPORTANT: Stats route MUST come before /:id routes

// GET /api/timesheet/stats - Get timesheet statistics (MOVE THIS UP!)
router.get("/stats", getTimesheetStats);

// GET /api/timesheet - Get timesheet records
router.get("/", getTimesheets);

// PUT /api/timesheet/:id - Update timesheet entry
router.put("/:id", updateTimesheet);

// DELETE /api/timesheet/:id - Delete timesheet entry
router.delete("/:id", deleteTimesheet);

// POST /api/timesheet - Create timesheet entry
router.post("/", createTimesheet);

// ==================== LEAVE MANAGEMENT ROUTES ====================

// GET /api/timesheet/leave/balance - Get leave balance (SPECIFIC ROUTES FIRST)
router.get("/leave/balance", getLeaveBalance);

// GET /api/timesheet/leave/pending - Get pending leave requests
router.get("/leave/pending", getPendingLeaves);

// POST /api/timesheet/leave - Create leave request
router.post("/leave", createLeaveRequest);

// GET /api/timesheet/leave - Get leave requests
router.get("/leave", getLeaveRequests);

// PUT /api/timesheet/leave/:id/status - Update leave status
router.put("/leave/:id/status", updateLeaveStatus);

// DELETE /api/timesheet/leave/:id - Delete leave request
router.delete("/leave/:id", deleteLeaveRequest);

// ==================== QUICK ACCESS ROUTES ====================

// GET /api/timesheet/employee/:employee_id/current-month
router.get("/employee/:employee_id/current-month", async (req, res) => {
  try {
    const { employee_id } = req.params;
    const now = new Date();
    const start_date = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const end_date = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    req.query = { employee_id, start_date, end_date };
    await getTimesheets(req, res);
  } catch (error) {
    console.error("Error in current month timesheet:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/timesheet/employee/:employee_id/today
router.get("/employee/:employee_id/today", async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = new Date().toISOString().split("T")[0];

    req.query = { employee_id, start_date: today, end_date: today };
    await getTimesheets(req, res);
  } catch (error) {
    console.error("Error in today timesheet:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/timesheet/clock-in - Quick clock in
router.post("/clock-in", async (req, res) => {
  try {
    const { employee_id, notes } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const clock_in = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    req.body = {
      employee_id,
      date: today,
      clock_in,
      attendance_status: "Present",
      work_hours_type: "Regular Hours",
      notes,
    };

    await createTimesheet(req, res);
  } catch (error) {
    console.error("Error in clock-in:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
