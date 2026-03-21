// routes/notification.routes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Routes protégées (nécessitent authentification)
router.get("/user/:userId", verifyToken, notificationController.getUserNotifications);
router.get("/user/:userId/unread-count", verifyToken, notificationController.getUnreadCount);
router.put("/user/:userId/mark-all-read", verifyToken, notificationController.markAllAsRead);

router.get("/enterprise/:enterpriseId", verifyToken, notificationController.getEnterpriseNotifications);
router.put("/:id/read", verifyToken, notificationController.markAsRead);
router.delete("/:id", verifyToken, notificationController.deleteNotification);

module.exports = router;