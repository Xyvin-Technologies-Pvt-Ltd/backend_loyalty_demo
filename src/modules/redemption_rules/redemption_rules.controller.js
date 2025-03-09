const response_handler = require("../../helpers/response_handler");
const RedemptionRules = require("../../models/redemption_rules_model");
const Transaction = require("../../models/transaction_model");
const Customer = require("../../models/customer_model");
const Tier = require("../../models/tier_model");
const validator = require("./redemption_rules.validator");
const { logger } = require("../../middlewares/logger");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

/**
 * Get the current active redemption rules
 */
exports.getRules = async (req, res) => {
    try {
        const rules = await RedemptionRules.getActiveRules();

        if (!rules) {
            return response_handler(res, 404, "No redemption rules found");
        }

        return response_handler(res, 200, "Redemption rules retrieved successfully", rules);
    } catch (error) {
        logger.error(`Error retrieving redemption rules: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Create or update redemption rules
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
        let rules = await RedemptionRules.getActiveRules();

        if (rules) {
            // Update existing rules
            rules.minimum_points_required = req.body.minimum_points_required;
            rules.maximum_points_per_day = req.body.maximum_points_per_day;
            rules.tier_multipliers = req.body.tier_multipliers;
            rules.updated_by = admin_id;

            await rules.save();
            logger.info(`Redemption rules updated by admin ${admin_id}`);

            return response_handler(res, 200, "Redemption rules updated successfully", rules);
        } else {
            // Create new rules
            const new_rules = new RedemptionRules({
                minimum_points_required: req.body.minimum_points_required,
                maximum_points_per_day: req.body.maximum_points_per_day,
                tier_multipliers: req.body.tier_multipliers,
                created_by: admin_id,
                updated_by: admin_id
            });

            await new_rules.save();
            logger.info(`New redemption rules created by admin ${admin_id}`);

            return response_handler(res, 201, "Redemption rules created successfully", new_rules);
        }
    } catch (error) {
        logger.error(`Error creating/updating redemption rules: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Validate if a user can redeem points
 */
exports.validateRedemption = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate request body
        const { error } = validator.validateRedemption.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const error_messages = error.details.map((err) => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }

        const { user_id, points_to_redeem, reward_type, reward_details } = req.body;

        // Get active redemption rules
        const rules = await RedemptionRules.getActiveRules();
        if (!rules) {
            return response_handler(res, 404, "Redemption rules not configured");
        }

        // Get user
        const user = await Customer.findById(user_id).populate('tier');
        if (!user) {
            return response_handler(res, 404, "User not found");
        }

        // Check if user has enough points
        if (user.points < points_to_redeem) {
            return response_handler(res, 400, "Insufficient points for redemption");
        }

        // Check if points to redeem meet minimum requirement
        if (points_to_redeem < rules.minimum_points_required) {
            return response_handler(
                res,
                400,
                `Minimum ${rules.minimum_points_required} points required for redemption`
            );
        }

        // Get user's tier multiplier
        let tier_multiplier = 1; // Default multiplier
        if (user.tier) {
            const tier_name = user.tier.name.toLowerCase();
            if (tier_name === 'silver' && rules.tier_multipliers.silver) {
                tier_multiplier = rules.tier_multipliers.silver;
            } else if (tier_name === 'gold' && rules.tier_multipliers.gold) {
                tier_multiplier = rules.tier_multipliers.gold;
            } else if (tier_name === 'platinum' && rules.tier_multipliers.platinum) {
                tier_multiplier = rules.tier_multipliers.platinum;
            }
        }

        // Calculate max points per day for this user based on tier
        const max_points_per_day = rules.maximum_points_per_day * tier_multiplier;

        // Check how many points user has already redeemed today
        const points_redeemed_today = await Transaction.getTotalPointsRedeemedToday(user_id);

        // Check if redeeming these points would exceed daily limit
        if (points_redeemed_today + points_to_redeem > max_points_per_day) {
            return response_handler(
                res,
                400,
                `Daily redemption limit of ${max_points_per_day} points would be exceeded`
            );
        }

        // Create redemption transaction
        const transaction = new Transaction({
            user: user_id,
            points: points_to_redeem,
            type: "redemption",
            status: "pending",
            transaction_date: new Date(),
            transaction_reference: uuidv4(),
            reward_type,
            reward_details,
            note: { message: "Points redeemed through loyalty program" }
        });

        await transaction.save({ session });

        // Deduct points from user
        user.points -= points_to_redeem;
        await user.save({ session });

        await session.commitTransaction();

        return response_handler(res, 200, "Redemption successful", {
            transaction,
            remaining_points: user.points,
            daily_limit_remaining: max_points_per_day - (points_redeemed_today + points_to_redeem)
        });
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Error validating redemption: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    } finally {
        session.endSession();
    }
};

/**
 * Get redemption history for a user
 */
exports.getRedemptionHistory = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {
            user: user_id,
            type: "redemption"
        };

        if (status) {
            query.status = status;
        }

        // Get transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ transaction_date: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await Transaction.countDocuments(query);

        return response_handler(res, 200, "Redemption history retrieved successfully", {
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(`Error retrieving redemption history: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Update redemption transaction status
 */
exports.updateRedemptionStatus = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        if (!["pending", "completed", "rejected", "cancelled"].includes(status)) {
            return response_handler(res, 400, "Invalid status value");
        }

        // Find transaction
        const transaction = await Transaction.findById(transaction_id);
        if (!transaction) {
            return response_handler(res, 404, "Redemption transaction not found");
        }

        // Verify it's a redemption transaction
        if (transaction.type !== "redemption") {
            return response_handler(res, 400, "Transaction is not a redemption transaction");
        }

        // Update status
        transaction.status = status;
        if (notes) {
            transaction.note = { ...transaction.note, admin_notes: notes };
        }

        await transaction.save();

        // If transaction is rejected or cancelled, refund points to user
        if (status === "rejected" || status === "cancelled") {
            const user = await Customer.findById(transaction.user);
            if (user) {
                user.points += transaction.points;
                await user.save();
                logger.info(`Refunded ${transaction.points} points to user ${user._id} due to ${status} redemption`);
            }
        }

        return response_handler(res, 200, "Redemption status updated successfully", transaction);
    } catch (error) {
        logger.error(`Error updating redemption status: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 