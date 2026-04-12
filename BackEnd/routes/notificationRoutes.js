const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notificationController");
const { notificationLimiter } = require("../middlewares/rateLimiterMiddleware");

router.get("/", notificationLimiter, isAuthenticated, notificationController.getNotifications);

router.patch("/:id/read", isAuthenticated, notificationController.markNotificationAsRead);


router.delete("/:id", isAuthenticated, notificationController.deleteNotification);


module.exports = router;