const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notificationController");
const { apiLimiter } = require("../middlewares/rateLimiterMiddleware");

router.use(apiLimiter);


// njibo notifs ll logedIn users (GET)
router.get("/", isAuthenticated, notificationController.getNotifications);


// read notification (UPDATE=PATCH)
router.patch("/:id/read", isAuthenticated, notificationController.markNotificationAsRead);


// nfasiw notif (DELETE)
router.delete("/:id", isAuthenticated, notificationController.deleteNotification);


module.exports = router;
