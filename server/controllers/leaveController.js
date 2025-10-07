const Leave = require("../models/Leave");

const leaveController = {
  // Get all pending leaves for approval
  getPendingLeaves: async (req, res) => {
    try {
      const result = await Leave.getPendingLeaves();
      res.json(result);
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending leaves",
      });
    }
  },

  // Approve or reject leave
  updateLeaveStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      // Get employee ID from logged in user's email
      const Employee = require("../models/Employee");
      const approver = await Employee.findOne({
        where: { email: req.user.email },
      });

      const approved_by = approver ? approver.id : null;

      const result = await Leave.updateStatus(id, status, approved_by, remarks);
      res.json(result);
    } catch (error) {
      console.error("Error updating leave status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update leave status",
      });
    }
  },

  // Get leave balance for all employees
  getAllEmployeeBalances: async (req, res) => {
    try {
      const { year = new Date().getFullYear() } = req.query;

      // Get all employees with their leave balances
      const Employee = require("../models/Employee");
      const employees = await Employee.findAll({
        attributes: ["id", "fullName", "department"],
      });

      const balancePromises = employees.map(async (emp) => {
        const balance = await Leave.getLeaveBalance(emp.id, year);
        return {
          employee_id: emp.id,
          employee_name: emp.fullName,
          department: emp.department,
          balances: balance.data,
        };
      });

      const results = await Promise.all(balancePromises);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error fetching employee balances:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch leave balances",
      });
    }
  },

  // Get all leaves with filters
  getAllLeaves: async (req, res) => {
    try {
      const filters = req.query;
      const result = await Leave.getAll(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch leaves",
      });
    }
  },
};

module.exports = leaveController;
