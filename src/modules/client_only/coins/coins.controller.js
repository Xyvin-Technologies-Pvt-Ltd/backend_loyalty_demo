const Customer = require("../../../models/customer_model");
const CoinConversionRule = require("../../../models/coin_management_model");
const Transaction = require("../../../models/transaction_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");
const mongoose = require("mongoose");

exports.convertPointsToCoins = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { points } = req.body;

        // Validate points
        if (!points || points <= 0) {
            return response_handler(res, 400, "Invalid points value", null);
        }

        // Get active conversion rules
        const conversionRule = await CoinConversionRule.getActiveRules();
        if (!conversionRule) {
            return response_handler(res, 404, "No active coin conversion rules found", null);
        }

        // Check if points meet minimum requirement
        if (points < conversionRule.minimumPoints) {
            return response_handler(res, 400, `Minimum ${conversionRule.minimumPoints} points required for conversion`, null);
        }

        // Calculate coins
        const coins = Math.floor(points / conversionRule.pointsPerCoin);
        if (coins <= 0) {
            return response_handler(res, 400, "Insufficient points for coin conversion", null);
        }

        // Get customer with current points
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return response_handler(res, 404, "Customer not found", null);
        }

        // Check if customer has enough points
        if (customer.total_points < points) {
            return response_handler(res, 400, "Insufficient points balance", null);
        }

        // Create transaction record
        const transaction = await Transaction.create({
            customer_id: customer._id,
            transaction_type: "convert_to_coins",
            points: -points, // Negative points as they're being deducted
            coins: coins,
            status: "pending",
            metadata: {
                conversion_rate: conversionRule.pointsPerCoin,
                minimum_points: conversionRule.minimumPoints
            }
        });

        // Update customer's points and coins
        await Customer.findByIdAndUpdate(
            customer._id,
            {
                $inc: {
                    total_points: -points,
                    coins: coins
                }
            },
            { session }
        );

        // Update transaction status
        await Transaction.findByIdAndUpdate(
            transaction._id,
            { status: "success" },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return response_handler(res, 200, "Points converted to coins successfully", {
            transaction_id: transaction._id,
            points_converted: points,
            coins_received: coins,
            conversion_rate: conversionRule.pointsPerCoin,
            remaining_points: customer.total_points - points,
            new_coin_balance: customer.coins + coins
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error(`Error converting points to coins: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.getCoinConversionDetails = async (req, res) => {
    try {
        const { points } = req.query;

        // Validate points
        if (!points || points <= 0) {
            return response_handler(res, 400, "Invalid points value", null);
        }

        // Get active conversion rules
        const conversionRule = await CoinConversionRule.getActiveRules();
        if (!conversionRule) {
            return response_handler(res, 404, "No active coin conversion rules found", null);
        }

        // Check if points meet minimum requirement
        if (points < conversionRule.minimumPoints) {
            return response_handler(res, 400, `Minimum ${conversionRule.minimumPoints} points required for conversion`, null);
        }

        // Calculate coins
        const coins = Math.floor(points / conversionRule.pointsPerCoin);
        if (coins <= 0) {
            return response_handler(res, 400, "Insufficient points for coin conversion", null);
        }

        // Get customer with current points
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return response_handler(res, 404, "Customer not found", null);
        }

        return response_handler(res, 200, "Coin conversion details retrieved successfully", {
            conversion_rule: {
                points_per_coin: conversionRule.pointsPerCoin,
                minimum_points: conversionRule.minimumPoints
            },
            conversion_details: {
                points_to_convert: points,
                coins_to_receive: coins,
                remaining_points: customer.total_points - points,
                new_coin_balance: customer.coins + coins
            },
            current_balance: {
                points: customer.total_points,
                coins: customer.coins
            }
        });
    } catch (error) {
        logger.error(`Error getting coin conversion details: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.getCoinHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, transaction_type } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {
            customer_id: req.user._id,
            coins: { $exists: true, $ne: 0 }
        };

        if (transaction_type) {
            query.transaction_type = transaction_type;
        }

        // Get transactions with pagination
        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Transaction.countDocuments(query)
        ]);

        return response_handler(res, 200, "Coin history retrieved successfully", {
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error getting coin history: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.getCoinBalance = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return response_handler(res, 404, "Customer not found", null);
        }

        return response_handler(res, 200, "Coin balance retrieved successfully", {
            coins: customer.coins,
            total_points: customer.total_points
        });
    } catch (error) {
        logger.error(`Error getting coin balance: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
}; 