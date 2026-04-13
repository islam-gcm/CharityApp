const Notification = require("../models/Notification");

const createNotification = async (user, type, message) => {
  return Notification.create({
    user,
    type,
    message
  });
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await notification.deleteOne();

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification
};
