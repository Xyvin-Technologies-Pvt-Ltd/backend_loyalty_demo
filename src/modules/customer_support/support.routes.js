const express = require("express");
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  addMessage,
  getTicketsByCustomer,
  getTicketStats,
} = require("./support.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for support tickets
const supportAudit = createAuditMiddleware("support_ticket");

// Routes that require MANAGE_SUPPORT permission
router.get(
  "/",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("view_support_tickets", {
    description: "Admin viewed all support tickets",
    targetModel: "SupportTicket",
  }),
  getAllTickets
);

router.get(
  "/stats",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("view_support_stats", {
    description: "Admin viewed support ticket statistics",
    targetModel: "SupportTicket",
  }),
  getTicketStats
);

router.get(
  "/:id",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("view_support_ticket", {
    description: "Admin viewed a support ticket",
    targetModel: "SupportTicket",
  }),
  getTicketById
);

router.post(
  "/",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("create_support_ticket", {
    description: "Admin created a new support ticket",
    targetModel: "SupportTicket",
  }),
  createTicket
);

router.put(
  "/:id",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("update_support_ticket", {
    description: "Admin updated a support ticket",
    targetModel: "SupportTicket",
  }),
  updateTicket
);

router.patch(
  "/:id/status",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("update_ticket_status", {
    description: "Admin updated a support ticket status",
    targetModel: "SupportTicket",
  }),
  updateTicketStatus
);

router.post(
  "/:id/messages",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("add_ticket_message", {
    description: "Admin added a message to a support ticket",
    targetModel: "SupportTicket",
  }),
  addMessage
);

router.get(
  "/customer/:customerId",
  authorizePermission("MANAGE_SUPPORT"),
  supportAudit.captureResponse(),
  supportAudit.adminAction("view_customer_tickets", {
    description: "Admin viewed customer support tickets",
    targetModel: "SupportTicket",
  }),
  getTicketsByCustomer
);

module.exports = router;
