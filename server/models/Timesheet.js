const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const Employee = require("./Employee");

const Timesheet = sequelize.define(
  "Timesheet",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clock_in: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    clock_out: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    break_hours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    total_hours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    work_hours_type: {
      type: DataTypes.ENUM(
        "Regular Hours",
        "Overtime",
        "Night Shift",
        "Holiday Work",
        "Weekend Work"
      ),
      defaultValue: "Regular Hours",
    },
    attendance_status: {
      type: DataTypes.ENUM("Present", "Absent", "Late", "Half Day", "On Leave"),
      defaultValue: "Present",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "timesheets",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["employee_id", "date"],
        name: "unique_employee_date",
      },
    ],
    hooks: {
      beforeCreate: (timesheet) => {
        calculateHours(timesheet);
      },
      beforeUpdate: (timesheet) => {
        calculateHours(timesheet);
      },
    },
  }
);

// Helper function to calculate hours
function calculateHours(timesheet) {
  if (timesheet.clock_in && timesheet.clock_out) {
    const clockIn = new Date(`2000-01-01 ${timesheet.clock_in}`);
    const clockOut = new Date(`2000-01-01 ${timesheet.clock_out}`);
    const diffMs = clockOut - clockIn;
    const diffHours = diffMs / (1000 * 60 * 60);

    timesheet.total_hours = Math.max(
      0,
      diffHours - (timesheet.break_hours || 0)
    );
    timesheet.overtime_hours =
      timesheet.total_hours > 8 ? timesheet.total_hours - 8 : 0;
  }
}

// Define associations
Timesheet.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "employee",
});

Employee.hasMany(Timesheet, {
  foreignKey: "employee_id",
  as: "timesheets",
});

// Static methods for compatibility with your existing controller
Timesheet.getByEmployeeAndDateRange = async function (
  employee_id,
  start_date,
  end_date
) {
  try {
    const timesheets = await this.findAll({
      where: {
        employee_id,
        date: {
          [sequelize.Sequelize.Op.between]: [start_date, end_date],
        },
      },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "position"],
        },
      ],
      order: [["date", "DESC"]],
    });

    return {
      success: true,
      data: timesheets.map((t) => ({
        ...t.toJSON(),
        employee_name: t.employee.fullName,
        department: t.employee.department,
        position: t.employee.position,
      })),
    };
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return {
      success: false,
      message: "Failed to fetch timesheet data",
    };
  }
};

Timesheet.getAllWithEmployeeInfo = async function (filters = {}) {
  try {
    const whereClause = {};
    const employeeWhere = {};

    if (filters.employee_id) whereClause.employee_id = filters.employee_id;
    if (filters.attendance_status)
      whereClause.attendance_status = filters.attendance_status;
    if (filters.department) employeeWhere.department = filters.department;

    if (filters.start_date && filters.end_date) {
      whereClause.date = {
        [sequelize.Sequelize.Op.between]: [
          filters.start_date,
          filters.end_date,
        ],
      };
    }

    const timesheets = await this.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "position", "employeeId"],
          where:
            Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
        },
      ],
      order: [
        ["date", "DESC"],
        [{ model: Employee, as: "employee" }, "fullName", "ASC"],
      ],
    });

    return {
      success: true,
      data: timesheets.map((t) => ({
        ...t.toJSON(),
        employee_name: t.employee.fullName,
        department: t.employee.department,
        position: t.employee.position,
        employeeId: t.employee.employeeId,
      })),
    };
  } catch (error) {
    console.error("Error fetching all timesheets:", error);
    return {
      success: false,
      message: "Failed to fetch timesheet data",
    };
  }
};

Timesheet.getStats = async function (
  employee_id = null,
  start_date = null,
  end_date = null
) {
  try {
    const whereClause = {};

    if (employee_id) whereClause.employee_id = employee_id;
    if (start_date && end_date) {
      whereClause.date = {
        [sequelize.Sequelize.Op.between]: [start_date, end_date],
      };
    }

    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn("COUNT", "*"), "total_entries"],
        [sequelize.fn("SUM", sequelize.col("total_hours")), "total_work_hours"],
        [
          sequelize.fn("SUM", sequelize.col("overtime_hours")),
          "total_overtime_hours",
        ],
        [sequelize.fn("AVG", sequelize.col("total_hours")), "avg_daily_hours"],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(
              "CASE WHEN attendance_status = 'Present' THEN 1 END"
            )
          ),
          "present_days",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(
              "CASE WHEN attendance_status = 'Absent' THEN 1 END"
            )
          ),
          "absent_days",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN attendance_status = 'Late' THEN 1 END")
          ),
          "late_days",
        ],
      ],
      raw: true,
    });

    return {
      success: true,
      data: stats[0],
    };
  } catch (error) {
    console.error("Error fetching timesheet stats:", error);
    return {
      success: false,
      message: "Failed to fetch timesheet statistics",
    };
  }
};

Timesheet.associate = (models) => {
  Timesheet.belongsTo(models.Employee, {
    foreignKey: "employee_id",
    as: "employee",
  });
};
module.exports = Timesheet;
