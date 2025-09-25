const { Sequelize } = require("sequelize");
require("dotenv").config();

// MySQL connection configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || "hr3", // Database name
  process.env.DB_USER || "root", // Username (default sa XAMPP)
  process.env.DB_PASSWORD || "", // Password (walang password by default sa XAMPP)
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false, // Turn off SQL logging for cleaner output
    define: {
      timestamps: true, // Automatic createdAt, updatedAt
      underscored: false, // Use camelCase instead of snake_case
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
      max: 5,
    },
  }
);

const connectToDatabase = async () => {
  try {
    console.log("ðŸ”„ Connecting to MySQL database...");

    // Test connection
    await sequelize.authenticate();
    console.log("âœ… MySQL Connected successfully!");
    console.log(`ðŸ“š Database: ${process.env.DB_NAME || "hr3"}`);
    console.log(`ðŸ  Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`ðŸ”Œ Port: ${process.env.DB_PORT || 3306}`);

    // Sync tables (create kung wala pa)
    await sequelize.sync({
      alter: false, // Set to true kung gusto mo auto-update schema
      force: false, // NEVER set to true sa production!
    });
    console.log("âœ… Database tables synced!");

    return true;
  } catch (error) {
    console.error("âŒ MySQL connection failed:", error.message);

    // More detailed error messages
    if (error.original) {
      console.error("ðŸ“ Error details:", error.original.message);

      if (error.original.code === "ECONNREFUSED") {
        console.error("ðŸ”§ Solution: Start XAMPP MySQL service");
      } else if (error.original.code === "ER_ACCESS_DENIED_ERROR") {
        console.error(
          "ðŸ”§ Solution: Check your MySQL username/password in .env"
        );
      } else if (error.original.code === "ER_BAD_DB_ERROR") {
        console.error("ðŸ”§ Solution: Create 'hr3' database in phpMyAdmin");
      }
    }

    console.error("ðŸ“‹ Troubleshooting steps:");
    console.error("   1. Start XAMPP Control Panel");
    console.error("   2. Start MySQL service");
    console.error("   3. Create 'hr3' database in phpMyAdmin");
    console.error("   4. Check .env file settings");

    throw error;
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nðŸ”¥ Closing MySQL connection...");
  await sequelize.close();
  process.exit(0);
});

// IMPORTANT: Export using CommonJS (not ES6)
module.exports = sequelize;
module.exports.connectToDatabase = connectToDatabase;
