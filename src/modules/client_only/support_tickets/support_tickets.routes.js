const express = require("express");
const router = express.Router();
const supportTicketsController = require("./support_tickets.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
router.use(sdkAuth([]));
router.use(sdkUserAuth);
// Create audit middleware for support tickets
const auditMiddleware = createAuditMiddleware("support_ticket");

// Create new support ticket
router.post(
    "/",
    sdkUserAuth,
    auditMiddleware.captureResponse(),
    auditMiddleware.sdkAction("create_support_ticket", {
        description: "Create a new support ticket",
        targetModel: "SupportTicket",
        details: (req) => req.query,
    }),
    supportTicketsController.createTicket
);

// Get all tickets for a customer
router.get(
    "/",
    sdkUserAuth,
    auditMiddleware.captureResponse(),
    auditMiddleware.sdkAction("get_my_tickets", {
        description: "Get all tickets for a customer",
        targetModel: "SupportTicket",
        details: (req) => req.query,
    }),
    supportTicketsController.getMyTickets
);

// Get specific ticket details
router.get(
    "/:ticket_id",
    sdkUserAuth,
    auditMiddleware.captureResponse(),
    auditMiddleware.sdkAction("get_ticket_by_id", {
        description: "Get specific ticket details",
        targetModel: "SupportTicket",
        details: (req) => req.params,
    }),
    supportTicketsController.getTicketById
);

// Add message to ticket
router.post(
    "/:ticket_id/messages",
    sdkUserAuth,
    auditMiddleware.captureResponse(),
    auditMiddleware.sdkAction("add_message_to_ticket", {
        description: "Add a message to a ticket",
        targetModel: "SupportTicket",
        details: (req) => req.params,
    }),
    supportTicketsController.addMessage
);

// Close ticket
router.post(
    "/:ticket_id/close",
    sdkUserAuth,
    auditMiddleware.captureResponse(),
    auditMiddleware.sdkAction("close_ticket", {
        description: "Close a ticket",
        targetModel: "SupportTicket",
        details: (req) => req.params,
    }),
    supportTicketsController.closeTicket
);

// Reopen ticket
router.post(
    "/:ticket_id/reopen",
    sdkUserAuth,
    auditMiddleware.captureResponse(),
    auditMiddleware.sdkAction("reopen_ticket", {
        description: "Reopen a ticket",
        targetModel: "SupportTicket",
        details: (req) => req.params,
    }),
    supportTicketsController.reopenTicket
);

module.exports = router; 