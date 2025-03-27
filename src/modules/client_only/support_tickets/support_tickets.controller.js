const SupportTicket = require("../../../models/support_ticket_model");
const { createError } = require("../../../utils/error_handler");

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

            res.status(201).json({
                status: true,
                message: "Support ticket created successfully",
                data: ticket,
            });
        } catch (error) {
            createError(error, res);
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

            res.status(200).json({
                status: true,
                message: "Support tickets fetched successfully",
                data: {
                    tickets,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(total / limit),
                    },
                },
            });
        } catch (error) {
            createError(error, res);
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

            res.status(200).json({
                status: true,
                message: "Support ticket fetched successfully",
                data: ticket,
            });
        } catch (error) {
            createError(error, res);
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
                return res.status(400).json({
                    status: false,
                    message: "Cannot add message to closed ticket",
                });
            }

            ticket.messages.push({
                sender_type: "Customer",
                sender: customer,
                message,
            });

            await ticket.save();

            res.status(200).json({
                status: true,
                message: "Message added successfully",
                data: ticket,
            });
        } catch (error) {
            createError(error, res);
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
                return res.status(404).json({
                    status: false,
                    message: "Support ticket not found",
                });
            }

            if (ticket.status === "closed") {
                return res.status(400).json({
                    status: false,
                    message: "Ticket is already closed",
                });
            }

            ticket.status = "closed";
            ticket.closed_at = new Date();
            await ticket.save();

            res.status(200).json({
                status: true,
                message: "Support ticket closed successfully",
                data: ticket,
            });
        } catch (error) {
            createError(error, res);
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
                return res.status(404).json({
                    status: false,
                    message: "Support ticket not found",
                });
            }

            if (ticket.status !== "closed") {
                return res.status(400).json({
                    status: false,
                    message: "Ticket is not closed",
                });
            }

            ticket.status = "reopened";
            ticket.closed_at = null;
            await ticket.save();

            res.status(200).json({
                status: true,
                message: "Support ticket reopened successfully",
                data: ticket,
            });
        } catch (error) {
            createError(error, res);
        }
    },
};

module.exports = supportTicketsController; 