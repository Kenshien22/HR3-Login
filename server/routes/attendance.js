const express = require("express");
const router = express.Router();
const verifyUser = require("../middleware/authMiddleware");
const {
  clockIn,
  clockOut,
  getAttendanceStatus,
  getMyAttendance,
  getRecentLateArrivals,
  getAllAttendance, // ADD THIS
} = require("../controllers/attendanceControllers");

// All routes require authentication
router.use(verifyUser);
// Add the route
router.get("/all", getAllAttendance); // ADD THIS LINE
router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/status", getAttendanceStatus);
router.get("/my-records", getMyAttendance);
router.get("/late-arrivals", getRecentLateArrivals); // NOW THIS WILL WORK

module.exports = router;
