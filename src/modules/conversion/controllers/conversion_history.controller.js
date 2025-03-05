const ConversionHistory = require('../../../models/conversion_history_model');
const ConversionRule = require('../../../models/conversion_rule_model');
const User = require('../../../models/user_model');
const response_handler = require('../../../helpers/response_handler');
const { logger } = require('../../../middlewares/logger');
const { AuditService } = require('../../audit');
const mongoose = require('mongoose');

/**
 * Get conversion history for a user
 * @route GET /api/v1/conversion/history/user/:userId
 */
exports.getUserConversionHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
            populate: {
                path: 'conversionRule',
                select: 'name conversionRate bonusPercentage'
            }
        };

        const history = await ConversionHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip((options.page - 1) * options.limit)
            .limit(options.limit)
            .populate(options.populate);

        const total = await ConversionHistory.countDocuments({ user: userId });

        return response_handler(res, 200, "Conversion history retrieved successfully", {
            history,
            pagination: {
                total,
                page: options.page,
                limit: options.limit,
                pages: Math.ceil(total / options.limit)
            }
        });
    } catch (error) {
        logger.error(`Error retrieving user conversion history: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "get_user_conversion_history",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error retrieving user conversion history",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: { userId: req.params.userId },
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get all conversion history (admin only)
 * @route GET /api/v1/conversion/history
 */
exports.getAllConversionHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
            populate: [
                {
                    path: 'user',
                    select: 'name email'
                },
                {
                    path: 'conversionRule',
                    select: 'name conversionRate bonusPercentage'
                },
                {
                    path: 'processedBy',
                    select: 'name email'
                }
            ]
        };

        // Build query
        const query = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.createdAt = {};

            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }

            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const history = await ConversionHistory.find(query)
            .sort({ createdAt: -1 })
            .skip((options.page - 1) * options.limit)
            .limit(options.limit)
            .populate(options.populate);

        const total = await ConversionHistory.countDocuments(query);

        return response_handler(res, 200, "Conversion history retrieved successfully", {
            history,
            pagination: {
                total,
                page: options.page,
                limit: options.limit,
                pages: Math.ceil(total / options.limit)
            }
        });
    } catch (error) {
        logger.error(`Error retrieving conversion history: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "get_all_conversion_history",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error retrieving all conversion history",
            errorMessage: error.message,
            stackTrace: error.stack,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get conversion history by ID
 * @route GET /api/v1/conversion/history/:id
 */
exports.getConversionHistoryById = async (req, res) => {
    try {
        const history = await ConversionHistory.findById(req.params.id)
            .populate('user', 'name email')
            .populate('conversionRule', 'name conversionRate bonusPercentage')
            .populate('processedBy', 'name email');

        if (!history) {
            return response_handler(res, 404, "Conversion history not found");
        }

        return response_handler(res, 200, "Conversion history retrieved successfully", history);
    } catch (error) {
        logger.error(`Error retrieving conversion history: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "get_conversion_history",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error retrieving conversion history",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: { historyId: req.params.id },
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Create a new conversion (convert points to coins)
 * @route POST /api/v1/conversion/convert
 */
exports.convertPointsToCoins = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { points, ruleId } = req.body;
        const userId = req.user._id;

        if (!points || points <= 0) {
            return response_handler(res, 400, "Points must be a positive number");
        }

        // Get user
        const user = await User.findById(userId).session(session);
        if (!user) {
            return response_handler(res, 404, "User not found");
        }

        // Check if user has enough points
        if (user.points < points) {
            return response_handler(res, 400, "Insufficient points for conversion");
        }

        // Get conversion rule
        let rule;

        if (ruleId) {
            rule = await ConversionRule.findById(ruleId).session(session);
            if (!rule) {
                return response_handler(res, 404, "Conversion rule not found");
            }
            if (!rule.isCurrentlyActive()) {
                return response_handler(res, 400, "The selected conversion rule is not currently active");
            }
        } else {
            // Get the default active rule (first one)
            const activeRules = await ConversionRule.findActiveRules();
            if (!activeRules || activeRules.length === 0) {
                return response_handler(res, 404, "No active conversion rules found");
            }
            rule = activeRules[0];
        }

        // Check minimum points requirement
        if (points < rule.minPointsRequired) {
            return response_handler(res, 400, `Minimum ${rule.minPointsRequired} points required for conversion`);
        }

        // Check maximum points limit if set
        if (rule.maxPointsPerConversion > 0 && points > rule.maxPointsPerConversion) {
            return response_handler(res, 400, `Maximum ${rule.maxPointsPerConversion} points allowed per conversion`);
        }

        // Calculate conversion
        const result = ConversionRule.calculateCoins(points, rule);

        // Format the conversion rate as a string (e.g., "1:10")
        const conversionRate = `1:${rule.conversionRate}`;

        // Create conversion history record
        const conversionHistory = new ConversionHistory({
            user: userId,
            points,
            coins: result.coins,
            bonus: result.bonus,
            conversionRate,
            conversionRule: rule._id,
            status: 'completed',
            transactionId: `CONV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            processedAt: new Date()
        });

        await conversionHistory.save({ session });

        // Update user's points and coins
        user.points -= points;
        user.coins += result.total;
        await user.save({ session });

        // Log user action
        await AuditService.logUserAction({
            action: "convert_points_to_coins",
            user: userId,
            userModel: "User",
            userName: user.name,
            userEmail: user.email,
            targetId: conversionHistory._id,
            targetModel: "ConversionHistory",
            description: `User converted ${points} points to ${result.total} coins`,
            details: {
                points,
                baseCoins: result.coins,
                bonusCoins: result.bonus,
                totalCoins: result.total,
                conversionRate,
                ruleId: rule._id
            }
        });

        await session.commitTransaction();
        session.endSession();

        return response_handler(res, 200, "Points converted to coins successfully", {
            conversionId: conversionHistory._id,
            points,
            baseCoins: result.coins,
            bonusCoins: result.bonus,
            totalCoins: result.total,
            conversionRate,
            transactionId: conversionHistory.transactionId,
            timestamp: conversionHistory.createdAt,
            updatedPoints: user.points,
            updatedCoins: user.coins
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        logger.error(`Error converting points to coins: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "convert_points_to_coins",
            status: "failure",
            user: req.user ? req.user._id : null,
            userModel: "User",
            userName: req.user ? req.user.name : null,
            userEmail: req.user ? req.user.email : null,
            description: "Error converting points to coins",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 