const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  try {
    console.log("ðŸ” Verifying token...");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("âŒ No authorization header");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      console.log("âŒ No token found");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    console.log("ðŸ” Token found, verifying...");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWT_KEY || "fallback_secret_key"
    );

    console.log("âœ… Token verified for user:", decoded.email);

    // Make sure we have both id formats for compatibility
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
      _id: decoded._id || decoded.id,
    };

    next();
  } catch (error) {
    console.error("âŒ Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token verification failed.",
    });
  }
};

module.exports = verifyUser;
