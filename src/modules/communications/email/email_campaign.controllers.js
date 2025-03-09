const EmailCampaign = require("../../../models/email_campaign_model");
const EmailTemplate = require("../../../models/email_template_model");
const Customer = require("../../../models/customer_model");
const { logger } = require("../../../middlewares/logger");
const { response_handler } = require("../../../helpers/response_handler");

/**
 * Create a new email campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEmailCampaign = async (req, res) => {
  try {
    const {
      name,
      subject,
      template,
      type,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
      content_variables,
    } = req.body;

    // Check if template exists
    const templateExists = await EmailTemplate.findById(template);
    if (!templateExists) {
      return response_handler(res, 400, "Email template not found");
    }

    // Create the campaign
    const campaign = new EmailCampaign({
      name,
      subject,
      template,
      type,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
      content_variables,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await campaign.save();

    return response_handler(
      res,
      201,
      "Email campaign created successfully",
      campaign
    );
  } catch (error) {
    logger.error(`Error creating email campaign: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to create email campaign",
      error.message
    );
  }
};

/**
 * Get all email campaigns with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEmailCampaigns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      type,
      status,
      sort_by = "createdAt",
      sort_order = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const campaigns = await EmailCampaign.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("template", "name type")
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    // Get total count for pagination
    const totalCampaigns = await EmailCampaign.countDocuments(filter);

    // Get overall email stats
    const stats = await EmailCampaign.aggregate([
      {
        $group: {
          _id: null,
          total_sent: { $sum: "$stats.total_sent" },
          total_opened: { $sum: "$stats.opened" },
          total_clicked: { $sum: "$stats.clicked" },
          total_bounced: { $sum: "$stats.bounced" },
        },
      },
    ]);

    const emailStats =
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
            bounce_rate:
              stats[0].total_sent > 0
                ? Math.round(
                    (stats[0].total_bounced / stats[0].total_sent) * 100
                  )
                : 0,
          }
        : {
            total_sent: 0,
            open_rate: 0,
            click_rate: 0,
            bounce_rate: 0,
          };

    // Get template count
    const templateCount = await EmailTemplate.countDocuments();

    return response_handler(
      res,
      200,
      "Email campaigns retrieved successfully",
      {
        campaigns,
        stats: emailStats,
        template_count: templateCount,
        pagination: {
          total: totalCampaigns,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCampaigns / parseInt(limit)),
        },
      }
    );
  } catch (error) {
    logger.error(`Error retrieving email campaigns: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve email campaigns",
      error.message
    );
  }
};

/**
 * Get an email campaign by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmailCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await EmailCampaign.findById(id)
      .populate("template", "name type body variables")
      .populate("segment", "name description")
      .populate("recipients", "name email phone")
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    if (!campaign) {
      return response_handler(res, 404, "Email campaign not found");
    }

    return response_handler(
      res,
      200,
      "Email campaign retrieved successfully",
      campaign
    );
  } catch (error) {
    logger.error(`Error retrieving email campaign: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve email campaign",
      error.message
    );
  }
};

/**
 * Update an email campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      subject,
      template,
      type,
      status,
      audience,
      segment,
      recipients,
      scheduled_date,
      content_variables,
    } = req.body;

    // Check if campaign exists
    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return response_handler(res, 404, "Email campaign not found");
    }

    // Check if campaign is already sent
    if (campaign.status === "sent") {
      return response_handler(
        res,
        400,
        "Cannot update a campaign that has already been sent"
      );
    }

    // Check if template exists if provided
    if (template) {
      const templateExists = await EmailTemplate.findById(template);
      if (!templateExists) {
        return response_handler(res, 400, "Email template not found");
      }
    }

    // Update campaign
    const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
      id,
      {
        name: name || campaign.name,
        subject: subject || campaign.subject,
        template: template || campaign.template,
        type: type || campaign.type,
        status: status || campaign.status,
        audience: audience || campaign.audience,
        segment: segment || campaign.segment,
        recipients: recipients || campaign.recipients,
        scheduled_date: scheduled_date || campaign.scheduled_date,
        content_variables: content_variables || campaign.content_variables,
        updated_by: req.user._id,
      },
      { new: true, runValidators: true }
    )
      .populate("template", "name type")
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    return response_handler(
      res,
      200,
      "Email campaign updated successfully",
      updatedCampaign
    );
  } catch (error) {
    logger.error(`Error updating email campaign: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to update email campaign",
      error.message
    );
  }
};

/**
 * Delete an email campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if campaign exists
    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return response_handler(res, 404, "Email campaign not found");
    }

    // Check if campaign is already sent
    if (campaign.status === "sent") {
      return response_handler(
        res,
        400,
        "Cannot delete a campaign that has already been sent"
      );
    }

    // Delete campaign
    await EmailCampaign.findByIdAndDelete(id);

    return response_handler(res, 200, "Email campaign deleted successfully");
  } catch (error) {
    logger.error(`Error deleting email campaign: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to delete email campaign",
      error.message
    );
  }
};

/**
 * Send a test email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendTestEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { test_email } = req.body;

    if (!test_email) {
      return response_handler(res, 400, "Test email address is required");
    }

    // Check if campaign exists
    const campaign = await EmailCampaign.findById(id).populate(
      "template",
      "name body variables"
    );

    if (!campaign) {
      return response_handler(res, 404, "Email campaign not found");
    }

    // In a real implementation, you would:
    // 1. Process the template with variables
    // 2. Send the email using your email service
    // 3. Return the result

    // For now, we'll just simulate success
    logger.info(
      `Test email for campaign ${campaign.name} sent to ${test_email}`
    );

    return response_handler(res, 200, "Test email sent successfully");
  } catch (error) {
    logger.error(`Error sending test email: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to send test email",
      error.message
    );
  }
};

/**
 * Send or schedule an email campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { send_now } = req.body;

    // Check if campaign exists
    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return response_handler(res, 404, "Email campaign not found");
    }

    // Check if campaign is already sent
    if (campaign.status === "sent") {
      return response_handler(res, 400, "Campaign has already been sent");
    }

    // Determine recipients based on audience type
    let recipients = [];

    if (campaign.audience === "all") {
      // Get all active customers with email
      const customerCount = await Customer.countDocuments({
        status: true,
        email: { $exists: true, $ne: "" },
      });

      // In a real implementation, you would process these in batches
      // For now, we'll just update the stats

      // Update campaign status and stats
      const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
        id,
        {
          status: send_now ? "sent" : "scheduled",
          sent_date: send_now ? new Date() : null,
          "stats.total_sent": customerCount,
        },
        { new: true }
      );

      return response_handler(
        res,
        200,
        send_now
          ? "Email campaign sent successfully"
          : "Email campaign scheduled successfully",
        updatedCampaign
      );
    } else if (campaign.audience === "segment" && campaign.segment) {
      // In a real implementation, you would:
      // 1. Get all customers in the segment
      // 2. Process and send emails to them
      // For now, we'll just simulate success

      // Update campaign status
      const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
        id,
        {
          status: send_now ? "sent" : "scheduled",
          sent_date: send_now ? new Date() : null,
          "stats.total_sent": 100, // Placeholder value
        },
        { new: true }
      );

      return response_handler(
        res,
        200,
        send_now
          ? "Email campaign sent successfully"
          : "Email campaign scheduled successfully",
        updatedCampaign
      );
    } else if (
      campaign.audience === "specific" &&
      campaign.recipients &&
      campaign.recipients.length > 0
    ) {
      // Update campaign status
      const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
        id,
        {
          status: send_now ? "sent" : "scheduled",
          sent_date: send_now ? new Date() : null,
          "stats.total_sent": campaign.recipients.length,
        },
        { new: true }
      );

      return response_handler(
        res,
        200,
        send_now
          ? "Email campaign sent successfully"
          : "Email campaign scheduled successfully",
        updatedCampaign
      );
    } else {
      return response_handler(
        res,
        400,
        "No recipients defined for this campaign"
      );
    }
  } catch (error) {
    logger.error(`Error sending/scheduling email campaign: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to send/schedule email campaign",
      error.message
    );
  }
};

module.exports = {
  createEmailCampaign,
  getAllEmailCampaigns,
  getEmailCampaignById,
  updateEmailCampaign,
  deleteEmailCampaign,
  sendTestEmail,
  sendEmailCampaign,
};
