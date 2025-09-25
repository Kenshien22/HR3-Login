const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scheduledIn: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    scheduledOut: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "present",
        "absent",
        "late",
        "half-day",
        "holiday",
        "weekend"
      ),
      defaultValue: "present",
    },
    lateMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    workHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "attendance",
    timestamps: true,
  }
);

module.exports = Attendance;
