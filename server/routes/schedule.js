const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router.get("/schedules", scheduleController.getSchedules);
router.post("/schedules/assign", scheduleController.assignSchedule);
router.delete("/schedules/remove", scheduleController.removeSchedule);
router.get("/shifts", scheduleController.getShifts);

module.exports = router;
