const express = require("express");
const {
  login,
  verify,
  changePassword,
} = require("../controllers/authControllers"); // ADD changePassword HERE
const verifyUser = require("../middleware/authMiddleware");

const router = express.Router();

// Login route
router.post("/login", login);

// Verify route - NOW WORKING
router.get("/verify", verifyUser, verify);

// Change password route
router.post("/change-password", verifyUser, changePassword);

module.exports = router;
