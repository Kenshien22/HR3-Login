const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");
require("dotenv").config();

// Login controller
// Login controller
const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email);

    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Try to find in Users table first (for admin)
    let user = await User.findOne({ where: { email: email.toLowerCase() } });
    let isEmployee = false;
    let isPasswordValid = false;

    if (user) {
      // Found in Users table - validate password
      isPasswordValid = await bcrypt.compare(password, user.password);

      if (!user.isActive) {
        console.log("❌ User inactive:", email);
        return res.status(401).json({
          success: false,
          message: "Account is inactive. Please contact administrator.",
        });
      }
    } else {
      // Not found in Users, check Employees table
      const employee = await Employee.findOne({
        where: { email: email.toLowerCase() },
      });

      if (employee) {
        // Validate employee password
        isPasswordValid = await employee.validatePassword(password);

        if (isPasswordValid) {
          // Create user-like object from employee
          user = {
            id: employee.id,
            email: employee.email,
            name: employee.fullName,
            role: employee.role,
            isActive: employee.status === "Active",
          };
          isEmployee = true;

          // Check if employee is active
          if (employee.status !== "Active") {
            console.log("❌ Employee inactive:", email);
            return res.status(401).json({
              success: false,
              message: "Employee account is inactive. Please contact HR.",
            });
          }
        }
      }
    }

    // If no user found or password invalid
    if (!user || !isPasswordValid) {
      console.log("❌ Invalid credentials for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user.id,
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || process.env.JWT_KEY || "fallback_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    console.log("✅ Login successful for:", email, "Role:", user.role);

    // Return success response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const verify = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let user = await User.findByPk(userId);

    // If not in User table, check Employee table
    if (!user) {
      user = await Employee.findByPk(userId);

      if (user) {
        // Convert employee to user format
        return res.json({
          success: true,
          message: "Token is valid",
          user: {
            id: user.id,
            _id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Register controller
const register = async (req, res) => {
  try {
    const { name, email, password, role = "employee" } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user (password will be hashed by the hook)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: newUser.id,
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET || process.env.JWT_KEY || "fallback_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by beforeUpdate hook
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
module.exports = {
  login,
  verify,
  register,
  getProfile,
  changePassword,
};
