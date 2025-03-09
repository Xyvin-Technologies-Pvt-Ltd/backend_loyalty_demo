const CustomerSegment = require("../../models/customer_segment_model");
const SegmentMembership = require("../../models/segment_membership_model");
const Customer = require("../../models/customer_model");
const Transaction = require("../../models/transaction_model");
const AppType = require("../../models/app_type_model");
const { logger } = require("../../middlewares/logger");
const { response_handler } = require("../../helpers/response_handler");
const mongoose = require("mongoose");

/**
 * Create a new customer segment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSegment = async (req, res) => {
  try {
    const { name, description, type, status, criteria, auto_refresh } =
      req.body;

    // Check if segment with the same name already exists
    const existingSegment = await CustomerSegment.findOne({ name });
    if (existingSegment) {
      return response_handler(
        res,
        400,
        "Segment with this name already exists"
      );
    }

    // Create the segment
    const segment = new CustomerSegment({
      name,
      description,
      type,
      status,
      criteria,
      auto_refresh,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await segment.save();

    // If the segment is active, process it immediately to populate customers
    if (status === "active") {
      // Process in background to avoid blocking the response
      processSegment(segment._id).catch((err) => {
        logger.error(`Error processing segment ${segment._id}: ${err.message}`);
      });
    }

    return response_handler(
      res,
      201,
      "Customer segment created successfully",
      segment
    );
  } catch (error) {
    logger.error(`Error creating customer segment: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to create customer segment",
      error.message
    );
  }
};

/**
 * Get all customer segments with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllSegments = async (req, res) => {
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
    const segments = await CustomerSegment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    // Get total count for pagination
    const totalSegments = await CustomerSegment.countDocuments(filter);

    // Get segment type counts
    const typeCounts = await CustomerSegment.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const typeStats = {};
    typeCounts.forEach((item) => {
      typeStats[item._id] = item.count;
    });

    return response_handler(
      res,
      200,
      "Customer segments retrieved successfully",
      {
        segments,
        type_stats: typeStats,
        pagination: {
          total: totalSegments,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalSegments / parseInt(limit)),
        },
      }
    );
  } catch (error) {
    logger.error(`Error retrieving customer segments: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve customer segments",
      error.message
    );
  }
};

/**
 * Get a customer segment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSegmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const segment = await CustomerSegment.findById(id)
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    if (!segment) {
      return response_handler(res, 404, "Customer segment not found");
    }

    // Get sample customers in this segment
    const sampleMembers = await SegmentMembership.find({ segment: id })
      .limit(10)
      .populate("customer", "name email phone");

    return response_handler(
      res,
      200,
      "Customer segment retrieved successfully",
      {
        segment,
        sample_members: sampleMembers,
      }
    );
  } catch (error) {
    logger.error(`Error retrieving customer segment: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve customer segment",
      error.message
    );
  }
};

/**
 * Update a customer segment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, status, criteria, auto_refresh } =
      req.body;

    // Check if segment exists
    const segment = await CustomerSegment.findById(id);

    if (!segment) {
      return response_handler(res, 404, "Customer segment not found");
    }

    // Check if name is being changed and if it already exists
    if (name && name !== segment.name) {
      const existingSegment = await CustomerSegment.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingSegment) {
        return response_handler(
          res,
          400,
          "Segment with this name already exists"
        );
      }
    }

    // Update segment
    const updatedSegment = await CustomerSegment.findByIdAndUpdate(
      id,
      {
        name: name || segment.name,
        description: description || segment.description,
        type: type || segment.type,
        status: status || segment.status,
        criteria: criteria || segment.criteria,
        auto_refresh: auto_refresh || segment.auto_refresh,
        updated_by: req.user._id,
      },
      { new: true, runValidators: true }
    )
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    // If the segment is active and criteria changed, reprocess it
    if (
      (status === "active" || segment.status === "active") &&
      JSON.stringify(criteria) !== JSON.stringify(segment.criteria)
    ) {
      // Process in background to avoid blocking the response
      processSegment(id).catch((err) => {
        logger.error(`Error processing segment ${id}: ${err.message}`);
      });
    }

    return response_handler(
      res,
      200,
      "Customer segment updated successfully",
      updatedSegment
    );
  } catch (error) {
    logger.error(`Error updating customer segment: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to update customer segment",
      error.message
    );
  }
};

/**
 * Delete a customer segment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSegment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if segment exists
    const segment = await CustomerSegment.findById(id);

    if (!segment) {
      return response_handler(res, 404, "Customer segment not found");
    }

    // Delete segment memberships first
    await SegmentMembership.deleteMany({ segment: id });

    // Delete segment
    await CustomerSegment.findByIdAndDelete(id);

    return response_handler(res, 200, "Customer segment deleted successfully");
  } catch (error) {
    logger.error(`Error deleting customer segment: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to delete customer segment",
      error.message
    );
  }
};

/**
 * Get customers in a segment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSegmentCustomers = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      sort_by = "added_at",
      sort_order = "desc",
    } = req.query;

    // Check if segment exists
    const segment = await CustomerSegment.findById(id);

    if (!segment) {
      return response_handler(res, 404, "Customer segment not found");
    }

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get customers in this segment with pagination
    const memberships = await SegmentMembership.find({ segment: id })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("customer", "name email phone status");

    // Get total count for pagination
    const totalCustomers = await SegmentMembership.countDocuments({
      segment: id,
    });

    return response_handler(
      res,
      200,
      "Segment customers retrieved successfully",
      {
        segment: {
          _id: segment._id,
          name: segment.name,
          type: segment.type,
          customer_count: segment.customer_count,
          last_refreshed: segment.last_refreshed,
        },
        customers: memberships.map((m) => ({
          ...m.customer.toObject(),
          added_at: m.added_at,
          metadata: m.metadata,
        })),
        pagination: {
          total: totalCustomers,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCustomers / parseInt(limit)),
        },
      }
    );
  } catch (error) {
    logger.error(`Error retrieving segment customers: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to retrieve segment customers",
      error.message
    );
  }
};

/**
 * Refresh a segment (recalculate members)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshSegment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if segment exists
    const segment = await CustomerSegment.findById(id);

    if (!segment) {
      return response_handler(res, 404, "Customer segment not found");
    }

    // Start processing in background
    processSegment(id).catch((err) => {
      logger.error(`Error processing segment ${id}: ${err.message}`);
    });

    return response_handler(res, 200, "Segment refresh started successfully");
  } catch (error) {
    logger.error(`Error refreshing segment: ${error.message}`);
    return response_handler(
      res,
      500,
      "Failed to refresh segment",
      error.message
    );
  }
};

/**
 * Process a segment to determine its members
 * @param {string} segmentId - ID of the segment to process
 */
const processSegment = async (segmentId) => {
  try {
    const segment = await CustomerSegment.findById(segmentId);

    if (!segment) {
      throw new Error("Segment not found");
    }

    // Skip processing if segment is not active
    if (segment.status !== "active") {
      return;
    }

    // Get all existing memberships for this segment
    const existingMemberships = await SegmentMembership.find({
      segment: segmentId,
    });
    const existingMemberIds = new Set(
      existingMemberships.map((m) => m.customer.toString())
    );

    // Determine which customers should be in this segment based on criteria
    const eligibleCustomers = await getEligibleCustomers(segment);
    const eligibleCustomerIds = new Set(
      eligibleCustomers.map((c) => c._id.toString())
    );

    // Customers to add (in eligible but not in existing)
    const customersToAdd = eligibleCustomers.filter(
      (c) => !existingMemberIds.has(c._id.toString())
    );

    // Customers to remove (in existing but not in eligible)
    const customersToRemove = existingMemberships.filter(
      (m) => !eligibleCustomerIds.has(m.customer.toString())
    );

    // Add new members
    if (customersToAdd.length > 0) {
      const memberships = customersToAdd.map((customer) => ({
        segment: segmentId,
        customer: customer._id,
        added_at: new Date(),
        metadata: getCustomerMetadata(customer, segment),
      }));

      await SegmentMembership.insertMany(memberships);
    }

    // Remove members who no longer qualify
    if (customersToRemove.length > 0) {
      await SegmentMembership.deleteMany({
        _id: { $in: customersToRemove.map((m) => m._id) },
      });
    }

    // Update segment with new count and refresh time
    await CustomerSegment.findByIdAndUpdate(segmentId, {
      customer_count: eligibleCustomers.length,
      last_refreshed: new Date(),
    });

    logger.info(
      `Processed segment ${segmentId}: Added ${customersToAdd.length}, Removed ${customersToRemove.length}, Total ${eligibleCustomers.length}`
    );
  } catch (error) {
    logger.error(`Error processing segment ${segmentId}: ${error.message}`);
    throw error;
  }
};

/**
 * Get customers eligible for a segment based on its criteria
 * @param {Object} segment - The segment document
 * @returns {Array} Array of eligible customer documents
 */
const getEligibleCustomers = async (segment) => {
  // Start with active customers
  let query = { status: true };

  // Apply criteria based on segment type
  switch (segment.type) {
    case "transaction":
      return await getTransactionBasedCustomers(segment.criteria.transaction);

    case "engagement":
      return await getEngagementBasedCustomers(segment.criteria.engagement);

    case "app_type":
      return await getAppTypeBasedCustomers(segment.criteria.app_type);

    case "device":
      return await getDeviceBasedCustomers(segment.criteria.device);

    case "custom":
      // For custom segments, use the provided MongoDB query
      if (segment.criteria.custom && segment.criteria.custom.query) {
        try {
          const customQuery = JSON.parse(segment.criteria.custom.query);
          query = { ...query, ...customQuery };
        } catch (error) {
          logger.error(`Error parsing custom query: ${error.message}`);
        }
      }
      break;
  }

  return await Customer.find(query);
};

/**
 * Get customers based on transaction criteria
 * @param {Object} criteria - Transaction criteria
 * @returns {Array} Array of eligible customer documents
 */
const getTransactionBasedCustomers = async (criteria) => {
  if (!criteria) return [];

  // Build date range for transaction period
  let startDate = null;
  const now = new Date();

  switch (criteria.transaction_period) {
    case "last_7_days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "last_30_days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "last_90_days":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "last_year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      // all_time - no start date filter
      break;
  }

  // Build transaction query
  const transactionQuery = { status: "completed" };

  if (startDate) {
    transactionQuery.transaction_date = { $gte: startDate };
  }

  if (criteria.transaction_types && criteria.transaction_types.length > 0) {
    transactionQuery.transaction_type = { $in: criteria.transaction_types };
  }

  if (criteria.sources && criteria.sources.length > 0) {
    transactionQuery.source = { $in: criteria.sources };
  }

  // Get transaction counts and amounts per customer
  const transactionStats = await Transaction.aggregate([
    { $match: transactionQuery },
    {
      $group: {
        _id: "$customer_id",
        transaction_count: { $sum: 1 },
        total_points: { $sum: "$points" },
        // For spend, we'd need a field that tracks monetary value
        // This is a placeholder assuming such a field exists
        total_spend: { $sum: { $abs: "$amount" } },
      },
    },
  ]);

  // Filter customers based on transaction criteria
  let eligibleCustomerIds = transactionStats.map((stat) => stat._id);

  if (criteria.min_transactions) {
    eligibleCustomerIds = transactionStats
      .filter((stat) => stat.transaction_count >= criteria.min_transactions)
      .map((stat) => stat._id);
  }

  if (criteria.max_transactions) {
    eligibleCustomerIds = transactionStats
      .filter((stat) => stat.transaction_count <= criteria.max_transactions)
      .map((stat) => stat._id);
  }

  if (criteria.min_points) {
    eligibleCustomerIds = transactionStats
      .filter((stat) => stat.total_points >= criteria.min_points)
      .map((stat) => stat._id);
  }

  if (criteria.max_points) {
    eligibleCustomerIds = transactionStats
      .filter((stat) => stat.total_points <= criteria.max_points)
      .map((stat) => stat._id);
  }

  if (criteria.min_spend) {
    eligibleCustomerIds = transactionStats
      .filter((stat) => stat.total_spend >= criteria.min_spend)
      .map((stat) => stat._id);
  }

  if (criteria.max_spend) {
    eligibleCustomerIds = transactionStats
      .filter((stat) => stat.total_spend <= criteria.max_spend)
      .map((stat) => stat._id);
  }

  // Get the actual customer documents
  return await Customer.find({
    _id: { $in: eligibleCustomerIds },
    status: true,
  });
};

/**
 * Get customers based on engagement criteria
 * @param {Object} criteria - Engagement criteria
 * @returns {Array} Array of eligible customer documents
 */
const getEngagementBasedCustomers = async (criteria) => {
  if (!criteria) return [];

  // This is a placeholder implementation
  // In a real system, you would query your analytics database or service
  // to get engagement metrics for customers

  // For now, we'll return all active customers
  return await Customer.find({ status: true });
};

/**
 * Get customers based on app type criteria
 * @param {Object} criteria - App type criteria
 * @returns {Array} Array of eligible customer documents
 */
const getAppTypeBasedCustomers = async (criteria) => {
  if (!criteria || !criteria.types || criteria.types.length === 0) return [];

  return await Customer.find({
    app_type: { $in: criteria.types },
    status: true,
  });
};

/**
 * Get customers based on device criteria
 * @param {Object} criteria - Device criteria
 * @returns {Array} Array of eligible customer documents
 */
const getDeviceBasedCustomers = async (criteria) => {
  if (!criteria) return [];

  // This is a placeholder implementation
  // In a real system, you would query your device database or service
  // to get device information for customers

  // For now, we'll return all active customers
  return await Customer.find({ status: true });
};

/**
 * Get metadata for a customer in a segment
 * @param {Object} customer - Customer document
 * @param {Object} segment - Segment document
 * @returns {Object} Metadata object
 */
const getCustomerMetadata = (customer, segment) => {
  const metadata = new Map();

  // Add relevant metadata based on segment type
  switch (segment.type) {
    case "transaction":
      // You could add transaction counts, total spend, etc.
      break;

    case "engagement":
      // You could add engagement metrics
      break;

    case "app_type":
      // You could add app type information
      if (customer.app_type) {
        metadata.set("app_types", customer.app_type);
      }
      break;

    case "device":
      // You could add device information
      break;
  }

  return metadata;
};

module.exports = {
  createSegment,
  getAllSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
  getSegmentCustomers,
  refreshSegment,
  processSegment,
};
