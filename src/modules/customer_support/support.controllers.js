const SupportTicket = require("../../models/support_ticket_model");
const Customer = require("../../models/customer_model");
const { logger } = require("../../middlewares/logger");
const  response_handler  = require("../../helpers/response_handler");

/**
 * Create a new support ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTicket = async (req, res) => {
  try {
    const {
      customer,
      subject,
      description,
      category,
      priority = "medium",
      related_transaction = null,
    } = req.body;

    // Check if customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return response_handler(res, 400, "Customer not found");
    }

    // Generate a unique ticket ID
    const ticketCount = await SupportTicket.countDocuments();
    const ticket_id = `TKT-${(ticketCount + 1).toString().padStart(3, "0")}`;

    // Create the ticket
    const ticket = new SupportTicket({
      ticket_id,
      customer,
      subject,
      description,
      category,
      priority,
      status: "open",
      related_transaction,
      messages: [
        {
          sender_type: "customer",
          sender: customer,
          message: description,
        },
      ],
    });

    await ticket.save();

    return response_handler(
      res,
      201,
      "Support ticket created successfully",
      ticket
    );
  } catch (error) {
    logger.error(`Error creating support ticket: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to create support ticket",
      error.message
    );
  }
};

/**
 * Get all support tickets with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assigned_to,
      customer,
      sort_by = "createdAt",
      sort_order = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assigned_to) filter.assigned_to = assigned_to;
    if (customer) filter.customer = customer;

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const tickets = await SupportTicket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("customer", "name email phone")
      .populate("assigned_to", "name email")
      .populate("related_transaction");

    // Get total count for pagination
    const totalTickets = await SupportTicket.countDocuments(filter);

    return response_handler(
      res,
      200,
      "Support tickets retrieved successfully",
      {
        tickets,
        pagination: {
          total: totalTickets,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalTickets / parseInt(limit)),
        },
      }
    );
  } catch (error) {
    logger.error(`Error retrieving support tickets: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve support tickets",
      error.message
    );
  }
};

/**
 * Get a support ticket by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id)
      .populate("customer", "name email phone")
      .populate("assigned_to", "name email")
      .populate("related_transaction")
      .populate("messages.sender");

    if (!ticket) {
      return response_handler(res, 404, "Support ticket not found");
    }

    return response_handler(
      res,
      200,
      "Support ticket retrieved successfully",
      ticket
    );
  } catch (error) {
    logger.error(`Error retrieving support ticket: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve support ticket",
      error.message
    );
  }
};

/**
 * Update a support ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, category, priority, assigned_to } = req.body;

    // Check if ticket exists
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return response_handler(res, 404, "Support ticket not found");
    }

    // Update ticket
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      id,
      { subject, category, priority, assigned_to },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email phone")
      .populate("assigned_to", "name email")
      .populate("related_transaction");

    return response_handler(
      res,
      200,
      "Support ticket updated successfully",
      updatedTicket
    );
  } catch (error) {
    logger.error(`Error updating support ticket: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to update support ticket",
      error.message
    );
  }
};

/**
 * Update a ticket's status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    // Check if ticket exists
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return response_handler(res, 404, "Support ticket not found");
    }

    // Update status and related fields
    const updates = { status };

    if (status === "resolved") {
      updates.resolved_at = new Date();
      updates.resolution_notes = resolution_notes || ticket.resolution_notes;
    } else if (status === "closed") {
      updates.closed_at = new Date();
    } else if (status === "reopened") {
      updates.resolved_at = null;
      updates.closed_at = null;
    }

    const updatedTicket = await SupportTicket.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name email phone")
      .populate("assigned_to", "name email");

    return response_handler(
      res,
      200,
      "Support ticket status updated successfully",
      updatedTicket
    );
  } catch (error) {
    logger.error(`Error updating support ticket status: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to update support ticket status",
      error.message
    );
  }
};

/**
 * Add a message to a ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { sender_type, sender, message, attachments = [] } = req.body;

    // Check if ticket exists
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return response_handler(res, 404, "Support ticket not found");
    }

    // Add message to ticket
    ticket.messages.push({
      sender_type,
      sender,
      message,
      attachments,
      created_at: new Date(),
    });

    // If ticket is closed or resolved, reopen it when customer adds a message
    if (
      (ticket.status === "closed" || ticket.status === "resolved") &&
      sender_type === "customer"
    ) {
      ticket.status = "reopened";
      ticket.resolved_at = null;
      ticket.closed_at = null;
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate("customer", "name email phone")
      .populate("assigned_to", "name email")
      .populate("messages.sender");

    return response_handler(
      res,
      200,
      "Message added successfully",
      updatedTicket
    );
  } catch (error) {
    logger.error(`Error adding message to support ticket: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to add message to support ticket",
      error.message
    );
  }
};

/**
 * Get tickets by customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sort_by = "createdAt",
      sort_order = "desc",
    } = req.query;

    // Build filter object
    const filter = { customer: customerId };

    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const tickets = await SupportTicket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("assigned_to", "name email");

    // Get total count for pagination
    const totalTickets = await SupportTicket.countDocuments(filter);

    return response_handler(
      res,
      200,
      "Customer support tickets retrieved successfully",
      {
        tickets,
        pagination: {
          total: totalTickets,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalTickets / parseInt(limit)),
        },
      }
    );
  } catch (error) {
    logger.error(`Error retrieving customer support tickets: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve customer support tickets",
      error.message
    );
  }
};

/**
 * Get support ticket statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await SupportTicket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get counts by category
    const categoryCounts = await SupportTicket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Get counts by priority
    const priorityCounts = await SupportTicket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Get average resolution time (for resolved tickets)
    const resolutionTimeData = await SupportTicket.aggregate([
      {
        $match: {
          status: "resolved",
          resolved_at: { $ne: null },
        },
      },
      {
        $project: {
          resolution_time: {
            $divide: [
              { $subtract: ["$resolved_at", "$createdAt"] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avg_resolution_time: { $avg: "$resolution_time" },
          min_resolution_time: { $min: "$resolution_time" },
          max_resolution_time: { $max: "$resolution_time" },
        },
      },
    ]);

    // Format the results
    const statusStats = {};
    statusCounts.forEach((item) => {
      statusStats[item._id] = item.count;
    });

    const categoryStats = {};
    categoryCounts.forEach((item) => {
      categoryStats[item._id] = item.count;
    });

    const priorityStats = {};
    priorityCounts.forEach((item) => {
      priorityStats[item._id] = item.count;
    });

    const resolutionTimeStats =
      resolutionTimeData.length > 0
        ? {
            average_hours:
              Math.round(resolutionTimeData[0].avg_resolution_time * 10) / 10,
            min_hours:
              Math.round(resolutionTimeData[0].min_resolution_time * 10) / 10,
            max_hours:
              Math.round(resolutionTimeData[0].max_resolution_time * 10) / 10,
          }
        : {
            average_hours: 0,
            min_hours: 0,
            max_hours: 0,
          };

    return response_handler(
      res,
      200,
      "Support ticket statistics retrieved successfully",
      {
        total_tickets: await SupportTicket.countDocuments(),
        by_status: statusStats,
        by_category: categoryStats,
        by_priority: priorityStats,
        resolution_time: resolutionTimeStats,
      }
    );
  } catch (error) {
    logger.error(
      `Error retrieving support ticket statistics: ${error.message}`
    );
    return response_handler(
      res,
      500,
      "Failed to retrieve support ticket statistics",
      error.message
    );
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  addMessage,
  getTicketsByCustomer,
  getTicketStats,
};
