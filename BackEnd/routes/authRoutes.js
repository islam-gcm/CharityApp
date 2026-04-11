const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { isAuthenticated } = require("../middlewares/authMiddleware");
const { normalizeEmail, validateEmail } = require("../middlewares/emailMiddleware");
const { apiLimiter, authLimiter } = require("../middlewares/rateLimiterMiddleware");

router.use(apiLimiter);

router.post("/register", authLimiter, normalizeEmail, validateEmail, authController.register);
router.post("/login", authLimiter, normalizeEmail, validateEmail, authController.login);
router.get("/me", isAuthenticated, authController.me);
router.put("/profile", isAuthenticated, normalizeEmail, validateEmail, authController.updateProfile);

module.exports = router;
