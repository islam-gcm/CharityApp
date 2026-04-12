const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { isAuthenticated, isAuthorized } = require("../middlewares/authMiddleware");
const { normalizeEmail, validateEmail } = require("../middlewares/emailMiddleware");
const { apiLimiter, authLimiter } = require("../middlewares/rateLimiterMiddleware");


router.post("/register", authLimiter, normalizeEmail, validateEmail, authController.register);
router.post("/login", authLimiter, normalizeEmail, validateEmail, authController.login);
router.get("/me", apiLimiter, isAuthenticated, authController.me);
router.put("/profile", apiLimiter, isAuthenticated, normalizeEmail, validateEmail, authController.updateProfile);
router.get("/charities", isAuthenticated, isAuthorized(["admin"]), authController.getCharities);
router.put("/charities/:id/status", isAuthenticated, isAuthorized(["admin"]), authController.updateCharityStatus);

module.exports = router;