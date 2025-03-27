const express = require("express");
const router = express.Router();
const supportTicketsController = require("./support_tickets.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middleware/sdk_auth");
const { createAuditMiddleware } = require("../../../middleware/audit_middleware");

// Apply SDK authentication middleware
router.use(sdkAuth);

// Create audit middleware for support tickets
const auditMiddleware = createAuditMiddleware("support_ticket");

// Create new support ticket
router.post(
    "/",
    sdkUserAuth,
    auditMiddleware,
    supportTicketsController.createTicket
);

// Get all tickets for a customer
router.get(
    "/",
    sdkUserAuth,
    auditMiddleware,
    supportTicketsController.getMyTickets
);

// Get specific ticket details
router.get(
    "/:ticket_id",
    sdkUserAuth,
    auditMiddleware,
    supportTicketsController.getTicketById
);

// Add message to ticket
router.post(
    "/:ticket_id/messages",
    sdkUserAuth,
    auditMiddleware,
    supportTicketsController.addMessage
);

// Close ticket
router.post(
    "/:ticket_id/close",
    sdkUserAuth,
    auditMiddleware,
    supportTicketsController.closeTicket
);

// Reopen ticket
router.post(
    "/:ticket_id/reopen",
    sdkUserAuth,
    auditMiddleware,
    supportTicketsController.reopenTicket
);

module.exports = router; 