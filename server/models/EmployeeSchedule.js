const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const EmployeeSchedule = sequelize.define(
  "EmployeeSchedule",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shift_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    schedule_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "cancelled"),
      defaultValue: "active",
    },
  },
  {
    tableName: "employee_schedules",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["employee_id", "schedule_date"],
      },
    ],
  }
);

module.exports = EmployeeSchedule;
