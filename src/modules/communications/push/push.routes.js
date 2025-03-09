const express = require("express");
const router = express.Router();
const {
  createPushNotification,
  getAllPushNotifications,
  getPushNotificationById,
  updatePushNotification,
  deletePushNotification,
  sendPushNotification,
} = require("./push_notification.controllers");
const { authorizePermission } = require("../../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../../audit");

// Create audit middleware for push notifications
const pushAudit = createAuditMiddleware("push_notification");

// Push Notification Routes
router.get(
  "/",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  pushAudit.captureResponse(),
  pushAudit.adminAction("view_push_notifications", {
    description: "Admin viewed all push notifications",
    targetModel: "PushNotification",
  }),
  getAllPushNotifications
);

router.get(
  "/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  pushAudit.captureResponse(),
  pushAudit.adminAction("view_push_notification", {
    description: "Admin viewed a push notification",
    targetModel: "PushNotification",
  }),
  getPushNotificationById
);

router.post(
  "/",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  pushAudit.captureResponse(),
  pushAudit.adminAction("create_push_notification", {
    description: "Admin created a new push notification",
    targetModel: "PushNotification",
  }),
  createPushNotification
);

router.put(
  "/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  pushAudit.captureResponse(),
  pushAudit.adminAction("update_push_notification", {
    description: "Admin updated a push notification",
    targetModel: "PushNotification",
  }),
  updatePushNotification
);

router.delete(
  "/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  pushAudit.captureResponse(),
  pushAudit.adminAction("delete_push_notification", {
    description: "Admin deleted a push notification",
    targetModel: "PushNotification",
  }),
  deletePushNotification
);

router.post(
  "/:id/send",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  pushAudit.captureResponse(),
  pushAudit.adminAction("send_push_notification", {
    description: "Admin sent or scheduled a push notification",
    targetModel: "PushNotification",
  }),
  sendPushNotification
);

module.exports = router;
