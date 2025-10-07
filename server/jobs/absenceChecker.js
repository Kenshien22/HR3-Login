const EmployeeSchedule = require("../models/EmployeeSchedule");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const checkAbsences = async () => {
  try {
    console.log("🔍 Checking for absences...");

    // FOR TESTING: Use Oct 1 instead of today
    const testDate = new Date("2025-10-01");
    const dateOnly = testDate.toISOString().split("T")[0];

    console.log(`Testing absence check for date: ${dateOnly}`);

    // Get all schedules for today
    const schedules = await EmployeeSchedule.findAll({
      where: {
        schedule_date: dateOnly,
        status: "active",
      },
      include: [
        {
          model: Employee,
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    console.log(
      `Found ${schedules.length} scheduled employees for ${dateOnly}`
    );

    for (const schedule of schedules) {
      const employee_id = schedule.employee_id;

      // Check if employee clocked in today
      const attendance = await Attendance.findOne({
        where: {
          employeeId: employee_id,
          date: dateOnly,
        },
      });

      // If no attendance record or no clock in, mark as absent
      if (!attendance || !attendance.clockIn) {
        console.log(`Marking ${schedule.Employee.fullName} as ABSENT`);

        if (attendance) {
          // Update existing record
          await attendance.update({
            status: "absent",
            notes: "Auto-marked absent - No clock in",
          });
        } else {
          // Create new absence record
          await Attendance.create({
            employeeId: employee_id,
            date: dateOnly,
            status: "absent",
            notes: "Auto-marked absent - No clock in",
          });
        }

        // ALSO CREATE TIMESHEET ENTRY FOR ABSENT
        const Timesheet = require("../models/Timesheet");
        const existingTimesheet = await Timesheet.findOne({
          where: {
            employee_id: employee_id,
            date: dateOnly,
          },
        });

        if (!existingTimesheet) {
          await Timesheet.create({
            employee_id: employee_id,
            date: dateOnly,
            clock_in: null,
            clock_out: null,
            total_hours: 0,
            overtime_hours: 0,
            attendance_status: "Absent",
            work_hours_type: "Regular Hours",
            notes: "Auto-marked absent - No clock in",
          });
          console.log(
            `Created timesheet entry for absent employee: ${schedule.Employee.fullName}`
          );
        }
      }
    }

    console.log("✅ Absence check completed");
  } catch (error) {
    console.error("❌ Error checking absences:", error);
  }
};

module.exports = checkAbsences;
