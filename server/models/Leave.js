const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const Employee = require("./Employee");

const Leave = sequelize.define(
  "Leave",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Employee,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    leave_type: {
      type: DataTypes.ENUM(
        "Vacation Leave",
        "Sick Leave",
        "Emergency Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Bereavement Leave"
      ),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    days_requested: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leave_status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Cancelled"),
      defaultValue: "Pending",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Employee,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    approved_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "leaves",
    timestamps: true,
    hooks: {
      beforeCreate: (leave) => {
        calculateDaysRequested(leave);
      },
      beforeUpdate: (leave) => {
        if (leave.changed("start_date") || leave.changed("end_date")) {
          calculateDaysRequested(leave);
        }
      },
    },
  }
);

// Helper function to calculate days requested
function calculateDaysRequested(leave) {
  if (leave.start_date && leave.end_date) {
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    leave.days_requested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
}

// Define associations
Leave.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "employee",
});

Leave.belongsTo(Employee, {
  foreignKey: "approved_by",
  as: "approver",
});

Employee.hasMany(Leave, {
  foreignKey: "employee_id",
  as: "leaves",
});

Employee.hasMany(Leave, {
  foreignKey: "approved_by",
  as: "approved_leaves",
});

// Static methods for compatibility with existing controller
Leave.getByEmployee = async function (employee_id, filters = {}) {
  try {
    const whereClause = { employee_id };

    if (filters.leave_status) whereClause.leave_status = filters.leave_status;
    if (filters.leave_type) whereClause.leave_type = filters.leave_type;
    if (filters.year) {
      whereClause.start_date = {
        [sequelize.Sequelize.Op.gte]: `${filters.year}-01-01`,
        [sequelize.Sequelize.Op.lt]: `${parseInt(filters.year) + 1}-01-01`,
      };
    }

    const leaves = await this.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "position"],
        },
        {
          model: Employee,
          as: "approver",
          attributes: ["fullName"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      data: leaves.map((l) => ({
        ...l.toJSON(),
        employee_name: l.employee.fullName,
        department: l.employee.department,
        approved_by_name: l.approver ? l.approver.fullName : null,
      })),
    };
  } catch (error) {
    console.error("Error fetching employee leaves:", error);
    return {
      success: false,
      message: "Failed to fetch leave data",
    };
  }
};

Leave.getAll = async function (filters = {}) {
  try {
    const whereClause = {};
    const employeeWhere = {};

    if (filters.leave_status) whereClause.leave_status = filters.leave_status;
    if (filters.leave_type) whereClause.leave_type = filters.leave_type;
    if (filters.department) employeeWhere.department = filters.department;

    if (filters.start_date && filters.end_date) {
      whereClause.start_date = {
        [sequelize.Sequelize.Op.between]: [
          filters.start_date,
          filters.end_date,
        ],
      };
    }

    const leaves = await this.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "position", "employeeId"],
          where:
            Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        },
        {
          model: Employee,
          as: "approver",
          attributes: ["fullName"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      data: leaves.map((l) => ({
        ...l.toJSON(),
        employee_name: l.employee.fullName,
        department: l.employee.department,
        position: l.employee.position,
        employeeId: l.employee.employeeId,
        approved_by_name: l.approver ? l.approver.fullName : null,
      })),
    };
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    return {
      success: false,
      message: "Failed to fetch leave data",
    };
  }
};

Leave.updateStatus = async function (
  id,
  status,
  approved_by = null,
  remarks = null
) {
  try {
    const leave = await this.findByPk(id);

    if (!leave) {
      return {
        success: false,
        message: "Leave request not found",
      };
    }

    const approved_date =
      status === "Approved" || status === "Rejected" ? new Date() : null;

    await leave.update({
      leave_status: status,
      approved_by,
      approved_date,
      remarks,
    });

    return {
      success: true,
      data: leave,
    };
  } catch (error) {
    console.error("Error updating leave status:", error);
    return {
      success: false,
      message: "Failed to update leave status",
    };
  }
};

Leave.getLeaveBalance = async function (
  employee_id,
  year = new Date().getFullYear()
) {
  try {
    const leaves = await this.findAll({
      where: {
        employee_id,
        start_date: {
          [sequelize.Sequelize.Op.gte]: `${year}-01-01`,
          [sequelize.Sequelize.Op.lt]: `${parseInt(year) + 1}-01-01`,
        },
      },
      attributes: [
        "leave_type",
        [sequelize.fn("COUNT", "*"), "total_requests"],
        [
          sequelize.fn("SUM", sequelize.col("days_requested")),
          "total_days_requested",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              "CASE WHEN leave_status = 'Approved' THEN days_requested ELSE 0 END"
            )
          ),
          "approved_days",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              "CASE WHEN leave_status = 'Pending' THEN days_requested ELSE 0 END"
            )
          ),
          "pending_days",
        ],
      ],
      group: ["leave_type"],
      raw: true,
    });

    return {
      success: true,
      data: leaves,
    };
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    return {
      success: false,
      message: "Failed to fetch leave balance",
    };
  }
};

Leave.getPendingLeaves = async function () {
  try {
    const leaves = await this.findAll({
      where: {
        leave_status: "Pending",
      },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "position", "employeeId"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return {
      success: true,
      data: leaves.map((l) => ({
        ...l.toJSON(),
        employee_name: l.employee.fullName,
        department: l.employee.department,
        position: l.employee.position,
        employeeId: l.employee.employeeId,
      })),
    };
  } catch (error) {
    console.error("Error fetching pending leaves:", error);
    return {
      success: false,
      message: "Failed to fetch pending leave requests",
    };
  }
};

module.exports = Leave;
