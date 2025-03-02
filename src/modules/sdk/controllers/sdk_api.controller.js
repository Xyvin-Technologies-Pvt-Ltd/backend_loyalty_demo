const Transaction = require("../../../models/transaction_model");
const User = require("../../../models/user_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");

/**
 * Get user points balance
 */
exports.getUserPoints = async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id);
        if (!user) {
            return response_handler(res, 404, "User not found");
        }

        return response_handler(res, 200, "User points retrieved successfully", {
            user_id: user._id,
            points: user.points,
            tier: user.tier
        });
    } catch (error) {
        logger.error(`SDK API error: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get user transactions
 */
exports.getUserTransactions = async (req, res) => {
    try {
        const { limit = 10, page = 1, type } = req.query;
        const skip = (page - 1) * limit;

        const query = { user: req.params.user_id };
        if (type) {
            query.type = type;
        }

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("-__v");

        const total = await Transaction.countDocuments(query);

        return response_handler(res, 200, "User transactions retrieved successfully", {
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`SDK API error: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Record a transaction (earn points)
 */
exports.recordTransaction = async (req, res) => {
    try {
        const { user_id, amount, points, type, merchant, note, provider, app } = req.body;

        if (!user_id || !points || !type) {
            return response_handler(res, 400, "Missing required fields: user_id, points, and type are required");
        }

        // Check if user exists
        const user = await User.findById(user_id);
        if (!user) {
            return response_handler(res, 404, "User not found");
        }

        // Create transaction
        const transaction = new Transaction({
            user: user_id,
            amount,
            points,
            type,
            merchant,
            note,
            provider,
            app,
            status: "completed"
        });

        await transaction.save();

        // Update user points
        if (type === "earning" || type === "referral") {
            user.points += points;
            await user.save();
        }

        return response_handler(res, 201, "Transaction recorded successfully", transaction);
    } catch (error) {
        logger.error(`SDK API error: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Redeem points
 */
exports.redeemPoints = async (req, res) => {
    try {
        const { user_id, points, reward_type, reward_details } = req.body;

        if (!user_id || !points || !reward_type) {
            return response_handler(res, 400, "Missing required fields: user_id, points, and reward_type are required");
        }

        // Check if user exists and has enough points
        const user = await User.findById(user_id);
        if (!user) {
            return response_handler(res, 404, "User not found");
        }

        if (user.points < points) {
            return response_handler(res, 400, "User does not have enough points");
        }

        // Create redemption transaction
        const transaction = new Transaction({
            user: user_id,
            points,
            type: "redemption",
            status: "completed",
            reward_type,
            reward_details,
            transaction_reference: `RED-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });

        await transaction.save();

        // Update user points
        user.points -= points;
        await user.save();

        return response_handler(res, 201, "Points redeemed successfully", transaction);
    } catch (error) {
        logger.error(`SDK API error: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get user profile with token
 */
exports.getUserProfile = async (req, res) => {
    try {
        // User is already attached to req.sdkUser by the sdkUserAuth middleware
        const user = req.sdkUser;

        return response_handler(res, 200, "User profile retrieved successfully", {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            points: user.points,
            tier: user.tier,
            referral_code: user.referral_code
        });
    } catch (error) {
        logger.error(`SDK API error: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 