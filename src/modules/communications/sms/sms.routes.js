const express = require("express");
const router = express.Router();
const {
  createSmsMessage,
  getAllSmsMessages,
  getSmsMessageById,
  updateSmsMessage,
  deleteSmsMessage,
  sendSmsMessage,
} = require("./sms_message.controllers");
const { authorizePermission } = require("../../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../../audit");

// Create audit middleware for SMS messages
const smsAudit = createAuditMiddleware("sms_message");

// SMS Message Routes
router.get(
  "/",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  smsAudit.captureResponse(),
  smsAudit.adminAction("view_sms_messages", {
    description: "Admin viewed all SMS messages",
    targetModel: "SmsMessage",
  }),
  getAllSmsMessages
);

router.get(
  "/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  smsAudit.captureResponse(),
  smsAudit.adminAction("view_sms_message", {
    description: "Admin viewed an SMS message",
    targetModel: "SmsMessage",
  }),
  getSmsMessageById
);

router.post(
  "/",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  smsAudit.captureResponse(),
  smsAudit.adminAction("create_sms_message", {
    description: "Admin created a new SMS message",
    targetModel: "SmsMessage",
  }),
  createSmsMessage
);

router.put(
  "/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  smsAudit.captureResponse(),
  smsAudit.adminAction("update_sms_message", {
    description: "Admin updated an SMS message",
    targetModel: "SmsMessage",
  }),
  updateSmsMessage
);

router.delete(
  "/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  smsAudit.captureResponse(),
  smsAudit.adminAction("delete_sms_message", {
    description: "Admin deleted an SMS message",
    targetModel: "SmsMessage",
  }),
  deleteSmsMessage
);

router.post(
  "/:id/send",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  smsAudit.captureResponse(),
  smsAudit.adminAction("send_sms_message", {
    description: "Admin sent or scheduled an SMS message",
    targetModel: "SmsMessage",
  }),
  sendSmsMessage
);

module.exports = router;
