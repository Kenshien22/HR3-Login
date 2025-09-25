const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./db/db");
const authRouter = require("./routes/auth");
const employeeRouter = require("./routes/employees");
const timesheetRoutes = require("./routes/timesheet");
const scheduleRoutes = require("./routes/schedule");
const leaveRoutes = require("./routes/leave");
const Shift = require("./models/Shift");
const EmployeeSchedule = require("./models/EmployeeSchedule");
const attendanceRoutes = require("./routes/attendance");

// IMPORT ALL MODELS
const User = require("./models/User");
const Employee = require("./models/Employee");
const Timesheet = require("./models/Timesheet");
const Leave = require("./models/Leave");
const Attendance = require("./models/Attendance");
const seedShifts = require("./seeders/shiftSeeder");

// SCHEDULE ASSOCIATIONS
Employee.hasMany(EmployeeSchedule, { foreignKey: "employee_id" });
EmployeeSchedule.belongsTo(Employee, { foreignKey: "employee_id" });
Shift.hasMany(EmployeeSchedule, { foreignKey: "shift_id" });
EmployeeSchedule.belongsTo(Shift, { foreignKey: "shift_id" });
Employee.hasMany(Attendance, { foreignKey: "employeeId" });
Attendance.belongsTo(Employee, { foreignKey: "employeeId" });
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/timesheet", timesheetRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "HR Management System API is running!" });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");

    // Sync models with database (with alter for development)
    await sequelize.sync({ force: false });
    console.log("✅ Database synchronized!");
    // Seed default data
    await seedShifts();

    // Log model associations
    console.log("📋 Model associations:");
    console.log("   - Employee -> hasMany Timesheets");
    console.log("   - Employee -> hasMany Leaves");
    console.log("   - Timesheet -> belongsTo Employee");
    console.log("   - Leave -> belongsTo Employee");
    console.log("   - Employee -> hasMany EmployeeSchedules");
    console.log("   - Shift -> hasMany EmployeeSchedules");
    console.log("   - EmployeeSchedule -> belongsTo Employee, Shift");
    console.log("   - Employee -> hasMany Attendance");
    console.log("   - Attendance -> belongsTo Employee");
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log("📋 Available routes:");
      console.log("   GET  /");
      console.log("   GET  /health");
      console.log("   POST /api/auth/login");
      console.log("   GET  /api/auth/verify");
      console.log("   GET  /api/employees");
      console.log("   POST /api/employees");
      console.log("   GET  /api/employees/stats");
      console.log("   GET  /api/employees/:id");
      console.log("   PUT  /api/employees/:id");
      console.log("   DELETE /api/employees/:id");
      console.log("   ");
      console.log("   📊 TIMESHEET ROUTES:");
      console.log("   GET  /api/timesheet/stats");
      console.log("   GET  /api/timesheet");
      console.log("   POST /api/timesheet");
      console.log("   PUT  /api/timesheet/:id");
      console.log("   DELETE /api/timesheet/:id");
      console.log("   ");
      console.log("   📝 LEAVE ROUTES:");
      console.log("   GET  /api/timesheet/leave/balance");
      console.log("   GET  /api/timesheet/leave/pending");
      console.log("   GET  /api/timesheet/leave");
      console.log("   POST /api/timesheet/leave");
      console.log("   PUT  /api/timesheet/leave/:id/status");
      console.log("   DELETE /api/timesheet/leave/:id");
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("📴 Shutting down server...");
  await sequelize.close();
  process.exit(0);
});

startServer();
