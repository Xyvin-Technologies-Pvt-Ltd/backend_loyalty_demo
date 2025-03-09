const PushNotification = require("../../../models/push_notification_model");
const Customer = require("../../../models/customer_model");
const { logger } = require("../../../middlewares/logger");
const { response_handler } = require("../../../helpers/response_handler");

/**
 * Create a new push notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPushNotification = async (req, res) => {
  try {
    const {
      title,
      body,
      image_url,
      action_url,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
    } = req.body;

    // Create the notification
    const notification = new PushNotification({
      title,
      body,
      image_url,
      action_url,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await notification.save();

    return response_handler(
      res,
      201,
      "Push notification created successfully",
      notification
    );
  } catch (error) {
    logger.error(`Error creating push notification: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to create push notification",
      error.message
    );
  }
};

/**
 * Get all push notifications with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPushNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      title,
      status,
      sort_by = "createdAt",
      sort_order = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (title) filter.title = { $regex: title, $options: "i" };
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const notifications = await PushNotification.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    // Get total count for pagination
    const totalNotifications = await PushNotification.countDocuments(filter);

    // Get overall push notification stats
    const stats = await PushNotification.aggregate([
      {
        $group: {
          _id: null,
          total_sent: { $sum: "$stats.total_sent" },
          total_opened: { $sum: "$stats.opened" },
          total_clicked: { $sum: "$stats.clicked" },
          total_failed: { $sum: "$stats.failed" },
        },
      },
    ]);

    const pushStats =
      stats.length > 0
        ? {
            total_sent: stats[0].total_sent,
            open_rate:
              stats[0].total_sent > 0
                ? Math.round(
                    (stats[0].total_opened / stats[0].total_sent) * 100
                  )
                : 0,
            click_rate:
              stats[0].total_sent > 0
                ? Math.round(
                    (stats[0].total_clicked / stats[0].total_sent) * 100
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
            open_rate: 0,
            click_rate: 0,
            failure_rate: 0,
          };

    // Get active users count (users who can receive push notifications)
    const activeUsers = await Customer.countDocuments({ status: true });

    return response_handler(
      res,
      200,
      "Push notifications retrieved successfully",
      {
        notifications,
        stats: pushStats,
        active_users: activeUsers,
        pagination: {
          total: totalNotifications,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalNotifications / parseInt(limit)),
        },
      }
    );
  } catch (error) {
    logger.error(`Error retrieving push notifications: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve push notifications",
      error.message
    );
  }
};

/**
 * Get a push notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPushNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await PushNotification.findById(id)
      .populate("segment", "name description")
      .populate("recipients", "name email phone")
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    if (!notification) {
      return response_handler(res, 404, "Push notification not found");
    }

    return response_handler(
      res,
      200,
      "Push notification retrieved successfully",
      notification
    );
  } catch (error) {
    logger.error(`Error retrieving push notification: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve push notification",
      error.message
    );
  }
};

/**
 * Update a push notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePushNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      body,
      image_url,
      action_url,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
    } = req.body;

    // Check if notification exists
    const notification = await PushNotification.findById(id);

    if (!notification) {
      return response_handler(res, 404, "Push notification not found");
    }

    // Check if notification is already sent
    if (notification.status === "sent") {
      return response_handler(
        res,
        400,
        "Cannot update a notification that has already been sent"
      );
    }

    // Update notification
    const updatedNotification = await PushNotification.findByIdAndUpdate(
      id,
      {
        title: title || notification.title,
        body: body || notification.body,
        image_url: image_url || notification.image_url,
        action_url: action_url || notification.action_url,
        status: status || notification.status,
        audience: audience || notification.audience,
        segment: segment || notification.segment,
        recipients: recipients || notification.recipients,
        scheduled_date: scheduled_date || notification.scheduled_date,
        updated_by: req.user._id,
      },
      { new: true, runValidators: true }
    )
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    return response_handler(
      res,
      200,
      "Push notification updated successfully",
      updatedNotification
    );
  } catch (error) {
    logger.error(`Error updating push notification: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to update push notification",
      error.message
    );
  }
};

/**
 * Delete a push notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePushNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification exists
    const notification = await PushNotification.findById(id);

    if (!notification) {
      return response_handler(res, 404, "Push notification not found");
    }

    // Check if notification is already sent
    if (notification.status === "sent") {
      return response_handler(
        res,
        400,
        "Cannot delete a notification that has already been sent"
      );
    }

    // Delete notification
    await PushNotification.findByIdAndDelete(id);

    return response_handler(res, 200, "Push notification deleted successfully");
  } catch (error) {
    logger.error(`Error deleting push notification: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to delete push notification",
      error.message
    );
  }
};

/**
 * Send or schedule a push notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendPushNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { send_now } = req.body;

    // Check if notification exists
    const notification = await PushNotification.findById(id);

    if (!notification) {
      return response_handler(res, 404, "Push notification not found");
    }

    // Check if notification is already sent
    if (notification.status === "sent") {
      return response_handler(res, 400, "Notification has already been sent");
    }

    // Determine recipients based on audience type
    let recipientCount = 0;

    if (notification.audience === "all") {
      // Get all active customers
      recipientCount = await Customer.countDocuments({ status: true });
    } else if (notification.audience === "segment" && notification.segment) {
      // In a real implementation, you would:
      // 1. Get all customers in the segment
      // 2. Count them
      // For now, we'll just use a placeholder value
      recipientCount = 100;
    } else if (
      notification.audience === "specific" &&
      notification.recipients &&
      notification.recipients.length > 0
    ) {
      recipientCount = notification.recipients.length;
    } else {
      return response_handler(
        res,
        400,
        "No recipients defined for this notification"
      );
    }

    // Update notification status and stats
    const updatedNotification = await PushNotification.findByIdAndUpdate(
      id,
      {
        status: send_now ? "sent" : "scheduled",
        sent_date: send_now ? new Date() : null,
        "stats.total_sent": recipientCount,
      },
      { new: true }
    );

    // In a real implementation, you would:
    // 1. Send the push notification to all recipients
    // 2. Track delivery status
    // 3. Update stats accordingly

    return response_handler(
      res,
      200,
      send_now
        ? "Push notification sent successfully"
        : "Push notification scheduled successfully",
      updatedNotification
    );
  } catch (error) {
    logger.error(
      `Error sending/scheduling push notification: ${error.message}`
    );
    return response_handler(
      res,
      500,
      "Failed to send/schedule push notification",
      error.message
    );
  }
};

module.exports = {
  createPushNotification,
  getAllPushNotifications,
  getPushNotificationById,
  updatePushNotification,
  deletePushNotification,
  sendPushNotification,
};
