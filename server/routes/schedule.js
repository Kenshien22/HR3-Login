const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const verifyUser = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");
const EmployeeSchedule = require("../models/EmployeeSchedule");
const Shift = require("../models/Shift");
const { Op } = require("sequelize");

router.get("/schedules", scheduleController.getSchedules);
router.post("/schedules/assign", scheduleController.assignSchedule);
router.delete("/schedules/remove", scheduleController.removeSchedule);
router.get("/shifts", scheduleController.getShifts);

// MY SCHEDULE ROUTE - PALITAN MO YUNG PATH
router.get("/my-schedule", verifyUser, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log("Getting schedule for:", userEmail);

    const employee = await Employee.findOne({
      where: { email: userEmail },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    console.log("Employee ID:", employee.id);

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const schedules = await EmployeeSchedule.findAll({
      where: {
        employee_id: employee.id,
        schedule_date: {
          [Op.between]: [today, nextWeek],
        },
      },
      include: [
        {
          model: Shift,
          attributes: ["name", "start_time", "end_time"],
        },
      ],
      order: [["schedule_date", "ASC"]],
    });

    console.log("Found schedules:", schedules.length);

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message,
    });
  }
});

module.exports = router;
