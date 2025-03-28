const SupportTicket = require("../../../models/support_ticket_model");
const response_handler = require("../../../helpers/response_handler");

const supportTicketsController = {
    // Create a new support ticket
    createTicket: async (req, res) => {
        try {
            const { subject, description, category } = req.body;
            const customer = req.user._id;

            // Generate unique ticket ID
            const ticket_id = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`;

            const ticket = await SupportTicket.create({
                ticket_id,
                customer,
                subject,
                description,
                category,
                status: "open",
                priority: "medium",
            });

            response_handler(res, 201,"Support ticket created successfully", ticket);
        } catch (error) {
            response_handler(res, 500, error.message, null);
        }
    },

    // Get all tickets for a customer
    getMyTickets: async (req, res) => {
        try {
            const { status, category, page = 1, limit = 10 } = req.query;
            const customer = req.user._id;

            const query = { customer };
            if (status) query.status = status;
            if (category) query.category = category;

            const tickets = await SupportTicket.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate("assigned_to", "name email");

            const total = await SupportTicket.countDocuments(query);

            response_handler(res, 200, "Support tickets fetched successfully", {
                    tickets,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(total / limit),
                    },
                });
        } catch (error) {
            response_handler(res, 500, error.message, null);
        }
    },

    // Get specific ticket details
    getTicketById: async (req, res) => {
        try {
            const { ticket_id } = req.params;
            const customer = req.user._id;

            const ticket = await SupportTicket.findOne({
                ticket_id,
                customer,
            }).populate("assigned_to", "name email");

            if (!ticket) {
                return res.status(404).json({
                    status: false,
                    message: "Support ticket not found",
                });
            }

            response_handler(res, 200, "Support ticket fetched successfully", ticket);
        } catch (error) {
            response_handler(res, 500, error.message, null);
        }
    },

    // Add message to ticket
    addMessage: async (req, res) => {
        try {
            const { ticket_id } = req.params;
            const { message } = req.body;
            const customer = req.user._id;

            const ticket = await SupportTicket.findOne({
                ticket_id,
                customer,
            });

            if (!ticket) {
                return res.status(404).json({
                    status: false,
                    message: "Support ticket not found",
                });
            }

            if (ticket.status === "closed") {
                return response_handler(res, 400, "Cannot add message to closed ticket", null);
            }

            ticket.messages.push({
                sender_type: "Customer",
                sender: customer,
                message,
            });

            await ticket.save();

            response_handler(res, 200, "Message added successfully", ticket);
        } catch (error) {
            response_handler(res, 500, error.message, null);
        }
    },

    // Close ticket
    closeTicket: async (req, res) => {
        try {
            const { ticket_id } = req.params;
            const customer = req.user._id;

            const ticket = await SupportTicket.findOne({
                ticket_id,
                customer,
            });

            if (!ticket) {
                return response_handler(res, 404, "Support ticket not found", null);
            }

            if (ticket.status === "closed") {
                return response_handler(res, 400, "Ticket is already closed", null);
            }

            ticket.status = "closed";
            ticket.closed_at = new Date();
            await ticket.save();

            response_handler(res, 200, "Support ticket closed successfully", ticket);
        } catch (error) {
            response_handler(res, 500, error.message, null);
        }
    },

    // Reopen ticket
    reopenTicket: async (req, res) => {
        try {
            const { ticket_id } = req.params;
            const customer = req.user._id;

            const ticket = await SupportTicket.findOne({
                ticket_id,
                customer,
            });

            if (!ticket) {
                return response_handler(res, 404, "Support ticket not found", null);
            }

            if (ticket.status !== "closed") {
                return response_handler(res, 400, "Ticket is not closed", null);
            }

            ticket.status = "reopened";
            ticket.closed_at = null;
            await ticket.save();

            response_handler(res, 200, "Support ticket reopened successfully", ticket);
        } catch (error) {
            response_handler(res, 500, error.message, null);
        }
    },
};

module.exports = supportTicketsController; 