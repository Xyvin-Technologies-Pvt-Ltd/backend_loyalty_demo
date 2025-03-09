const response_handler = require("../../helpers/response_handler");
const PointsExpirationRules = require("../../models/points_expiration_rules_model");
const Transaction = require("../../models/transaction_model");
const Customer = require("../../models/customer_model");
const Tier = require("../../models/tier_model");
const validator = require("./points_expiration.validator");
const { logger } = require("../../middlewares/logger");
const mongoose = require("mongoose");

/**
 * Get the current active points expiration rules
 */
exports.getRules = async (req, res) => {
    try {
        const rules = await PointsExpirationRules.getActiveRules();

        if (!rules) {
            return response_handler(res, 404, "No points expiration rules found");
        }

        return response_handler(res, 200, "Points expiration rules retrieved successfully", rules);
    } catch (error) {
        logger.error(`Error retrieving points expiration rules: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Create or update points expiration rules
 */
exports.createOrUpdateRules = async (req, res) => {
    try {
        // Validate request body
        const { error } = validator.createOrUpdateRules.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const error_messages = error.details.map((err) => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }

        // Get admin ID from request (assuming it's set by auth middleware)
        const admin_id = req.admin ? req.admin._id : null;

        // Check if rules already exist
        let rules = await PointsExpirationRules.getActiveRules();

        if (rules) {
            // Update existing rules
            rules.default_expiry_period = req.body.default_expiry_period;
            rules.tier_extensions = req.body.tier_extensions;
            rules.expiry_notifications = req.body.expiry_notifications;
            rules.grace_period = req.body.grace_period;
            rules.updated_by = admin_id;

            await rules.save();
            logger.info(`Points expiration rules updated by admin ${admin_id}`);

            return response_handler(res, 200, "Points expiration rules updated successfully", rules);
        } else {
            // Create new rules
            const new_rules = new PointsExpirationRules({
                default_expiry_period: req.body.default_expiry_period,
                tier_extensions: req.body.tier_extensions,
                expiry_notifications: req.body.expiry_notifications,
                grace_period: req.body.grace_period,
                created_by: admin_id,
                updated_by: admin_id
            });

            await new_rules.save();
            logger.info(`New points expiration rules created by admin ${admin_id}`);

            return response_handler(res, 201, "Points expiration rules created successfully", new_rules);
        }
    } catch (error) {
        logger.error(`Error creating/updating points expiration rules: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get user's points with expiration information
 */
exports.getUserPointsWithExpiry = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists
        const user = await Customer.findById(user_id);
        if (!user) {
            return response_handler(res, 404, "User not found");
        }

        // Get user's points with expiration information
        const pointsInfo = await Transaction.getUserPointBalanceWithExpiry(user_id);

        return response_handler(res, 200, "User points retrieved successfully", {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            points: pointsInfo
        });
    } catch (error) {
        logger.error(`Error retrieving user points with expiry: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Process expired points (admin only)
 */
exports.processExpiredPoints = async (req, res) => {
    try {
        // Process expired points
        const result = await Transaction.processExpiredPoints();

        logger.info(`Processed expired points: ${result.totalExpiredPoints} points expired from ${result.expiredTransactions} transactions affecting ${result.affectedUsers} users`);

        return response_handler(res, 200, "Expired points processed successfully", result);
    } catch (error) {
        logger.error(`Error processing expired points: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get points expiring soon for a user
 */
exports.getPointsExpiringSoon = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { days = 30 } = req.query;

        // Check if user exists
        const user = await Customer.findById(user_id);
        if (!user) {
            return response_handler(res, 404, "User not found");
        }

        // Calculate the date threshold
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + parseInt(days));

        // Find transactions with points expiring soon
        const expiringTransactions = await Transaction.find({
            user: user_id,
            type: { $in: ["earning", "referral"] },
            status: "completed",
            is_expired: false,
            points_remaining: { $gt: 0 },
            expiry_date: { $lte: threshold, $gte: new Date() }
        }).sort({ expiry_date: 1 });

        // Calculate total expiring points
        const totalExpiringPoints = expiringTransactions.reduce((sum, tx) => sum + tx.points_remaining, 0);

        // Group by expiry date
        const groupedByDate = expiringTransactions.reduce((acc, tx) => {
            const dateStr = tx.expiry_date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!acc[dateStr]) {
                acc[dateStr] = {
                    date: tx.expiry_date,
                    points: 0,
                    transactions: []
                };
            }

            acc[dateStr].points += tx.points_remaining;
            acc[dateStr].transactions.push({
                _id: tx._id,
                points: tx.points_remaining,
                transaction_date: tx.transaction_date,
                expiry_date: tx.expiry_date
            });

            return acc;
        }, {});

        return response_handler(res, 200, "Expiring points retrieved successfully", {
            totalExpiringPoints,
            expiringPoints: Object.values(groupedByDate).sort((a, b) => a.date - b.date)
        });
    } catch (error) {
        logger.error(`Error retrieving expiring points: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 