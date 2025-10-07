const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const Employee = require("./Employee");

const Claim = sequelize.define(
  "Claim",
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
    },
    claim_type: {
      type: DataTypes.ENUM(
        "Medical",
        "Travel",
        "Training",
        "Meal",
        "Equipment",
        "Others"
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    claim_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    receipt_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    receipt_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Processing"),
      defaultValue: "Pending",
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Employee,
        key: "id",
      },
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
    tableName: "claims",
    timestamps: true,
  }
);

Claim.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "employee",
});

Employee.hasMany(Claim, {
  foreignKey: "employee_id",
  as: "claims",
});

module.exports = Claim;
