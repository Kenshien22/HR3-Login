const Shift = require("../models/Shift");

const seedShifts = async () => {
  try {
    const existingShifts = await Shift.count();

    if (existingShifts === 0) {
      await Shift.bulkCreate([
        {
          name: "Morning Shift",
          start_time: "08:00:00",
          end_time: "17:00:00",
          description: "Regular morning shift",
        },
        {
          name: "Afternoon Shift",
          start_time: "13:00:00",
          end_time: "22:00:00",
          description: "Afternoon to evening shift",
        },
        {
          name: "Night Shift",
          start_time: "22:00:00",
          end_time: "06:00:00",
          description: "Night shift with differential",
        },
      ]);

      console.log("✅ Default shifts created");
    }
  } catch (error) {
    console.error("❌ Error seeding shifts:", error);
  }
};

module.exports = seedShifts;
