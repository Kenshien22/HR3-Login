const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const verifyUser = require("../middleware/authMiddleware");

router.use(verifyUser);
router.get("/leaves/pending", leaveController.getPendingLeaves);
router.put("/leaves/:id/status", leaveController.updateLeaveStatus);
router.get("/leaves/balances", leaveController.getAllEmployeeBalances);
router.get("/leaves", leaveController.getAllLeaves);

module.exports = router;
