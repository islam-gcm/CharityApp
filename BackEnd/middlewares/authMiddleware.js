const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const tokenValue = token.replace("Bearer ", "").trim();
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.role) {
      return res.status(403).json({ message: "Authorization problem" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      organization: user.organization
    };

    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);

    const message = err.name === "TokenExpiredError"
      ? "Token expired"
      : "Invalid token";

    res.status(401).json({ message });
  }
};

const isAuthorized = (allowedRoles) => {
  return async (req, res, next) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Action not authorized" });
    }

    next();
  };
};

module.exports = { isAuthenticated, isAuthorized };
