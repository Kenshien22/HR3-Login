const express = require("express");
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  bulkUpdateStatus,
  getEmployeeProfile,
} = require("../controllers/employeeControllers");
const verifyUser = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyUser);

// Employee routes
router.get("/", getAllEmployees); // GET /api/employees
router.get("/stats", getEmployeeStats); // GET /api/employees/stats
router.get("/profile", getEmployeeProfile); // MOVE THIS BEFORE /:id
router.get("/:id", getEmployeeById); // GET /api/employees/:id
router.post("/", createEmployee); // POST /api/employees
router.put("/:id", updateEmployee); // PUT /api/employees/:id
router.delete("/:id", deleteEmployee); // DELETE /api/employees/:id
router.patch("/bulk-status", bulkUpdateStatus); // PATCH /api/employees/bulk-status

module.exports = router;
