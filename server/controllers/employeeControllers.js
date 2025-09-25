const Employee = require("../models/Employee");
const { Op } = require("sequelize");

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: {
        employees,
        count: employees.length,
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
      data: { employee },
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Add default password if not provided
    if (!employeeData.password) {
      employeeData.password = "default123";
    }

    // Add default role if not provided
    if (!employeeData.role) {
      employeeData.role = "employee";
    }

    // Validate required fields
    if (
      !employeeData.fullName ||
      !employeeData.email ||
      !employeeData.password ||
      !employeeData.department ||
      !employeeData.position ||
      !employeeData.salary ||
      !employeeData.startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: fullName, email, department, position, salary, startDate",
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({
      where: { email: employeeData.email },
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // Create employee with all fields
    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: { employee },
    });
  } catch (error) {
    console.error("Error creating employee:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      department,
      position,
      salary,
      startDate,
      status,
      notes,
      phoneNumber,
      address,
      emergencyContact,
      emergencyPhone,
    } = req.body;

    // Find employee
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({
        where: {
          email,
          id: { [Op.ne]: id }, // Exclude current employee
        },
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Another employee with this email already exists",
        });
      }
    }

    // Prepare update data
    const updateData = {
      fullName: fullName || employee.fullName,
      email: email || employee.email,
      department: department || employee.department,
      position: position || employee.position,
      salary: salary ? parseFloat(salary) : employee.salary,
      startDate: startDate || employee.startDate,
      status: status || employee.status,
      role: req.body.role || employee.role, // ADD THIS
      notes: notes !== undefined ? notes : employee.notes,
      phoneNumber:
        phoneNumber !== undefined ? phoneNumber : employee.phoneNumber,
      address: address !== undefined ? address : employee.address,
      emergencyContact:
        emergencyContact !== undefined
          ? emergencyContact
          : employee.emergencyContact,
      emergencyPhone:
        emergencyPhone !== undefined ? emergencyPhone : employee.emergencyPhone,
    };

    // Add password if provided
    if (req.body.password && req.body.password.trim() !== "") {
      updateData.password = req.body.password; // Will be hashed by beforeUpdate hook
    }

    // Update employee
    await employee.update(updateData);

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: { employee },
    });
  } catch (error) {
    console.error("Error updating employee:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Find employee
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Delete employee
    await employee.destroy();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};

// Get employee statistics
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({
      where: { status: "Active" },
    });

    // Calculate average salary
    const salaryResult = await Employee.findAll({
      attributes: [
        [
          Employee.sequelize.fn("AVG", Employee.sequelize.col("salary")),
          "avgSalary",
        ],
      ],
      raw: true,
    });

    const averageSalary = salaryResult[0]?.avgSalary || 0;

    // Get department breakdown
    const departmentStats = await Employee.findAll({
      attributes: [
        "department",
        [Employee.sequelize.fn("COUNT", Employee.sequelize.col("id")), "count"],
      ],
      group: ["department"],
      raw: true,
    });

    // Get status breakdown
    const statusStats = await Employee.findAll({
      attributes: [
        "status",
        [Employee.sequelize.fn("COUNT", Employee.sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    res.status(200).json({
      success: true,
      message: "Employee statistics retrieved successfully",
      data: {
        summary: {
          totalEmployees,
          activeEmployees,
          averageSalary: parseFloat(averageSalary) || 0,
        },
        departmentBreakdown: departmentStats,
        statusBreakdown: statusStats,
      },
    });
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee statistics",
      error: error.message,
    });
  }
};

// Bulk update employee status
const bulkUpdateStatus = async (req, res) => {
  try {
    const { employeeIds, status } = req.body;

    if (
      !employeeIds ||
      !Array.isArray(employeeIds) ||
      employeeIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of employee IDs",
      });
    }

    if (!status || !["Active", "Inactive", "On Leave"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status (Active, Inactive, On Leave)",
      });
    }

    // Update employees
    const [updatedCount] = await Employee.update(
      { status },
      {
        where: {
          id: {
            [Op.in]: employeeIds,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} employee(s)`,
      data: {
        updatedCount,
        status,
      },
    });
  } catch (error) {
    console.error("Error bulk updating employee status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update employee status",
      error: error.message,
    });
  }
};
// Get employee profile by email - ADD THIS FUNCTION
const getEmployeeProfile = async (req, res) => {
  try {
    const userEmail = req.user.email; // From JWT token

    const employee = await Employee.findOne({
      where: { email: userEmail },
      attributes: { exclude: ["password"] }, // Don't send password
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee profile",
    });
  }
};
module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  bulkUpdateStatus,
  getEmployeeProfile, // ADD THIS LINE
};
