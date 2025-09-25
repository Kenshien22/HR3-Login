const Shift = require("../models/Shift");
const EmployeeSchedule = require("../models/EmployeeSchedule");
const Employee = require("../models/Employee");
const scheduleController = {
  // Get schedules for date range
  getSchedules: async (req, res) => {
    try {
      const { start_date, end_date, employee_id } = req.query;

      let whereClause = { status: "active" };

      if (start_date && end_date) {
        whereClause.schedule_date = {
          [require("sequelize").Op.between]: [start_date, end_date],
        };
      }

      if (employee_id) {
        whereClause.employee_id = employee_id;
      }

      const schedules = await EmployeeSchedule.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            attributes: ["id", "fullName", "department"],
          },
          {
            model: Shift,
            attributes: ["id", "name", "start_time", "end_time"],
          },
        ],
        order: [["schedule_date", "ASC"]],
      });

      res.json({
        success: true,
        data: schedules,
      });
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch schedules",
      });
    }
  },

  // Assign schedule
  assignSchedule: async (req, res) => {
    try {
      const { employee_id, shift_id, schedule_date } = req.body;

      if (!employee_id || !shift_id || !schedule_date) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Upsert (update or insert)
      const [schedule, created] = await EmployeeSchedule.upsert({
        employee_id,
        shift_id,
        schedule_date,
        status: "active",
      });

      res.json({
        success: true,
        message: created
          ? "Schedule assigned successfully"
          : "Schedule updated successfully",
        data: schedule,
      });
    } catch (error) {
      console.error("Error assigning schedule:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign schedule",
      });
    }
  },

  // Remove schedule
  removeSchedule: async (req, res) => {
    try {
      const { employee_id, schedule_date } = req.body;

      await EmployeeSchedule.destroy({
        where: {
          employee_id,
          schedule_date,
        },
      });

      res.json({
        success: true,
        message: "Schedule removed successfully",
      });
    } catch (error) {
      console.error("Error removing schedule:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove schedule",
      });
    }
  },

  // Get all shifts
  getShifts: async (req, res) => {
    try {
      const shifts = await Shift.findAll({
        order: [["start_time", "ASC"]],
      });

      res.json({
        success: true,
        data: shifts,
      });
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch shifts",
      });
    }
  },
};

module.exports = scheduleController;
