const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const bcrypt = require("bcrypt");

const Employee = sequelize.define(
  "Employee",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "employee"),
      defaultValue: "employee",
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive", "On Leave"),
      defaultValue: "Active",
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
    },
    address: {
      type: DataTypes.TEXT,
    },
    emergencyContact: {
      type: DataTypes.STRING(100),
    },
    emergencyPhone: {
      type: DataTypes.STRING(20),
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "employees",
    timestamps: true,
    hooks: {
      beforeCreate: async (employee) => {
        // Auto-generate employee ID
        const lastEmployee = await Employee.findOne({
          order: [["id", "DESC"]],
        });
        const nextId = lastEmployee ? lastEmployee.id + 1 : 1;
        employee.employeeId = `EMP${String(nextId).padStart(4, "0")}`;

        // Hash password
        if (employee.password) {
          const salt = await bcrypt.genSalt(10);
          employee.password = await bcrypt.hash(employee.password, salt);
        }
      },
      beforeUpdate: async (employee) => {
        // Hash password if changed
        if (employee.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          employee.password = await bcrypt.hash(employee.password, salt);
        }
      },
    },
  }
);

// Instance method to validate password
Employee.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Employee;
