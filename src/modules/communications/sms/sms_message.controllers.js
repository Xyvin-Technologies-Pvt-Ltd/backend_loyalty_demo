const SmsMessage = require("../../../models/sms_message_model");
const Customer = require("../../../models/customer_model");
const { logger } = require("../../../middlewares/logger");
const { response_handler } = require("../../../helpers/response_handler");

/**
 * Create a new SMS message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSmsMessage = async (req, res) => {
  try {
    const {
      title,
      body,
      type,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
      variables,
    } = req.body;

    // Validate SMS length
    if (body.length > 160) {
      return response_handler(
        res,
        400,
        "SMS body exceeds maximum length of 160 characters"
      );
    }

    // Create the message
    const message = new SmsMessage({
      title,
      body,
      type,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
      variables,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await message.save();

    return response_handler(
      res,
      201,
      "SMS message created successfully",
      message
    );
  } catch (error) {
    logger.error(`Error creating SMS message: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to create SMS message",
      error.message
    );
  }
};

/**
 * Get all SMS messages with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllSmsMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      title,
      type,
      status,
      sort_by = "createdAt",
      sort_order = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (title) filter.title = { $regex: title, $options: "i" };
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const messages = await SmsMessage.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    // Get total count for pagination
    const totalMessages = await SmsMessage.countDocuments(filter);

    // Get overall SMS stats
    const stats = await SmsMessage.aggregate([
      {
        $group: {
          _id: null,
          total_sent: { $sum: "$stats.total_sent" },
          total_delivered: { $sum: "$stats.delivered" },
          total_failed: { $sum: "$stats.failed" },
        },
      },
    ]);

    const smsStats =
      stats.length > 0
        ? {
            total_sent: stats[0].total_sent,
            delivery_rate:
              stats[0].total_sent > 0
                ? Math.round(
                    (stats[0].total_delivered / stats[0].total_sent) * 100
                  )
                : 0,
            failure_rate:
              stats[0].total_sent > 0
                ? Math.round(
                    (stats[0].total_failed / stats[0].total_sent) * 100
                  )
                : 0,
          }
        : {
            total_sent: 0,
            delivery_rate: 0,
            failure_rate: 0,
          };

    // Get recipients count (customers with phone numbers)
    const recipientsCount = await Customer.countDocuments({
      status: true,
      phone: { $exists: true, $ne: "" },
    });

    return response_handler(res, 200, "SMS messages retrieved successfully", {
      messages,
      stats: smsStats,
      recipients_count: recipientsCount,
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalMessages / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error(`Error retrieving SMS messages: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve SMS messages",
      error.message
    );
  }
};

/**
 * Get an SMS message by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSmsMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await SmsMessage.findById(id)
      .populate("segment", "name description")
      .populate("recipients", "name email phone")
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    if (!message) {
      return response_handler(res, 404, "SMS message not found");
    }

    return response_handler(
      res,
      200,
      "SMS message retrieved successfully",
      message
    );
  } catch (error) {
    logger.error(`Error retrieving SMS message: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve SMS message",
      error.message
    );
  }
};

/**
 * Update an SMS message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSmsMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      body,
      type,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
      variables,
    } = req.body;

    // Check if message exists
    const message = await SmsMessage.findById(id);

    if (!message) {
      return response_handler(res, 404, "SMS message not found");
    }

    // Check if message is already sent
    if (message.status === "sent") {
      return response_handler(
        res,
        400,
        "Cannot update a message that has already been sent"
      );
    }

    // Validate SMS length if body is provided
    if (body && body.length > 160) {
      return response_handler(
        res,
        400,
        "SMS body exceeds maximum length of 160 characters"
      );
    }

    // Update message
    const updatedMessage = await SmsMessage.findByIdAndUpdate(
      id,
      {
        title: title || message.title,
        body: body || message.body,
        type: type || message.type,
        status: status || message.status,
        audience: audience || message.audience,
        segment: segment || message.segment,
        recipients: recipients || message.recipients,
        scheduled_date: scheduled_date || message.scheduled_date,
        variables: variables || message.variables,
        updated_by: req.user._id,
      },
      { new: true, runValidators: true }
    )
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    return response_handler(
      res,
      200,
      "SMS message updated successfully",
      updatedMessage
    );
  } catch (error) {
    logger.error(`Error updating SMS message: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to update SMS message",
      error.message
    );
  }
};

/**
 * Delete an SMS message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSmsMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if message exists
    const message = await SmsMessage.findById(id);

    if (!message) {
      return response_handler(res, 404, "SMS message not found");
    }

    // Check if message is already sent
    if (message.status === "sent") {
      return response_handler(
        res,
        400,
        "Cannot delete a message that has already been sent"
      );
    }

    // Delete message
    await SmsMessage.findByIdAndDelete(id);

    return response_handler(res, 200, "SMS message deleted successfully");
  } catch (error) {
    logger.error(`Error deleting SMS message: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to delete SMS message",
      error.message
    );
  }
};

/**
 * Send or schedule an SMS message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendSmsMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { send_now } = req.body;

    // Check if message exists
    const message = await SmsMessage.findById(id);

    if (!message) {
      return response_handler(res, 404, "SMS message not found");
    }

    // Check if message is already sent
    if (message.status === "sent") {
      return response_handler(res, 400, "Message has already been sent");
    }

    // Determine recipients based on audience type
    let recipientCount = 0;

    if (message.audience === "all") {
      // Get all active customers with phone numbers
      recipientCount = await Customer.countDocuments({
        status: true,
        phone: { $exists: true, $ne: "" },
      });
    } else if (message.audience === "segment" && message.segment) {
      // In a real implementation, you would:
      // 1. Get all customers in the segment with phone numbers
      // 2. Count them
      // For now, we'll just use a placeholder value
      recipientCount = 100;
    } else if (
      message.audience === "specific" &&
      message.recipients &&
      message.recipients.length > 0
    ) {
      recipientCount = message.recipients.length;
    } else {
      return response_handler(
        res,
        400,
        "No recipients defined for this message"
      );
    }

    // Update message status and stats
    const updatedMessage = await SmsMessage.findByIdAndUpdate(
      id,
      {
        status: send_now ? "sent" : "scheduled",
        sent_date: send_now ? new Date() : null,
        "stats.total_sent": recipientCount,
      },
      { new: true }
    );

    // In a real implementation, you would:
    // 1. Send the SMS to all recipients
    // 2. Track delivery status
    // 3. Update stats accordingly

    return response_handler(
      res,
      200,
      send_now
        ? "SMS message sent successfully"
        : "SMS message scheduled successfully",
      updatedMessage
    );
  } catch (error) {
    logger.error(`Error sending/scheduling SMS message: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to send/schedule SMS message",
      error.message
    );
  }
};

module.exports = {
  createSmsMessage,
  getAllSmsMessages,
  getSmsMessageById,
  updateSmsMessage,
  deleteSmsMessage,
  sendSmsMessage,
};
