const EmailTemplate = require("../../../models/email_template_model");
const { logger } = require("../../../middlewares/logger");
const { response_handler } = require("../../../helpers/response_handler");

/**
 * Create a new email template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, description, type, status, variables } =
      req.body;

    // Check if template with the same name already exists
    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return response_handler(
        res,
        400,
        "Email template with this name already exists"
      );
    }

    // Create the template
    const template = new EmailTemplate({
      name,
      subject,
      body,
      description,
      type,
      status,
      variables,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await template.save();

    return response_handler(
      res,
      201,
      "Email template created successfully",
      template
    );
  } catch (error) {
    logger.error(`Error creating email template: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to create email template",
      error.message
    );
  }
};

/**
 * Get all email templates with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEmailTemplates = async (req, res) => {
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
    const templates = await EmailTemplate.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    // Get total count for pagination
    const totalTemplates = await EmailTemplate.countDocuments(filter);

    return response_handler(
      res,
      200,
      "Email templates retrieved successfully",
      {
        templates,
        pagination: {
          total: totalTemplates,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalTemplates / parseInt(limit)),
        },
      }
    );
  } catch (error) {
    logger.error(`Error retrieving email templates: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve email templates",
      error.message
    );
  }
};

/**
 * Get an email template by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmailTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findById(id)
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    if (!template) {
      return response_handler(res, 404, "Email template not found");
    }

    return response_handler(
      res,
      200,
      "Email template retrieved successfully",
      template
    );
  } catch (error) {
    logger.error(`Error retrieving email template: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve email template",
      error.message
    );
  }
};

/**
 * Update an email template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body, description, type, status, variables } =
      req.body;

    // Check if template exists
    const template = await EmailTemplate.findById(id);

    if (!template) {
      return response_handler(res, 404, "Email template not found");
    }

    // Check if name is being changed and if it already exists
    if (name && name !== template.name) {
      const existingTemplate = await EmailTemplate.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingTemplate) {
        return response_handler(
          res,
          400,
          "Email template with this name already exists"
        );
      }
    }

    // Update template
    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      {
        name: name || template.name,
        subject: subject || template.subject,
        body: body || template.body,
        description: description || template.description,
        type: type || template.type,
        status: status || template.status,
        variables: variables || template.variables,
        updated_by: req.user._id,
      },
      { new: true, runValidators: true }
    )
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    return response_handler(
      res,
      200,
      "Email template updated successfully",
      updatedTemplate
    );
  } catch (error) {
    logger.error(`Error updating email template: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to update email template",
      error.message
    );
  }
};

/**
 * Delete an email template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if template exists
    const template = await EmailTemplate.findById(id);

    if (!template) {
      return response_handler(res, 404, "Email template not found");
    }

    // Delete template
    await EmailTemplate.findByIdAndDelete(id);

    return response_handler(res, 200, "Email template deleted successfully");
  } catch (error) {
    logger.error(`Error deleting email template: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to delete email template",
      error.message
    );
  }
};

module.exports = {
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
};
