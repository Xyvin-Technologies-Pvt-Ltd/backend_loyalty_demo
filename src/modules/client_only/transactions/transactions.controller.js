const Transaction = require("../../../models/transaction_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");

exports.getMyTransactions = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const {
            page = 1,
            limit = 10,
            transaction_type,
            start_date,
            end_date,
            status
        } = req.query;

        // Build query
        const query = { customer_id };

        // Add filters if provided
        if (transaction_type) {
            query.transaction_type = transaction_type;
        }
        if (status) {
            query.status = status;
        }
        if (start_date || end_date) {
            query.transaction_date = {};
            if (start_date) {
                query.transaction_date.$gte = new Date(start_date);
            }
            if (end_date) {
                query.transaction_date.$lte = new Date(end_date);
            }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get transactions with pagination and populate references
        const transactions = await Transaction.find(query)
            .populate("point_criteria", "name description points")
            .populate("app_type", "name")
            .sort({ transaction_date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Transaction.countDocuments(query);

        // Calculate summary
        const summary = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$transaction_type",
                    total_points: { $sum: "$points" },
                    count: { $sum: 1 }
                }
            }
        ]);

        return response_handler.success(res, "Transactions retrieved successfully", {
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            },
            summary: summary.reduce((acc, curr) => {
                acc[curr._id] = {
                    total_points: curr.total_points,
                    count: curr.count
                };
                return acc;
            }, {})
        });
    } catch (error) {
        logger.error(`Error fetching transactions: ${error.message}`);
        return response_handler.error(res, error);
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const { customer_id } = req.query;

        const query = { transaction_id };
        if (customer_id) {
            query.customer_id = customer_id;
        }

        const transaction = await Transaction.findOne(query)
            .populate("point_criteria", "name description points")
            .populate("app_type", "name");

        if (!transaction) {
            return response_handler.error(res, "Transaction not found", 404);
        }

        return response_handler.success(res, "Transaction retrieved successfully", transaction);
    } catch (error) {
        logger.error(`Error fetching transaction: ${error.message}`);
        return response_handler.error(res, error);
    }
};

exports.getTransactionSummary = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { start_date, end_date } = req.query;

        // Build date query if provided
        const dateQuery = {};
        if (start_date || end_date) {
            dateQuery.transaction_date = {};
            if (start_date) {
                dateQuery.transaction_date.$gte = new Date(start_date);
            }
            if (end_date) {
                dateQuery.transaction_date.$lte = new Date(end_date);
            }
        }

        // Get summary by transaction type
        const summaryByType = await Transaction.aggregate([
            {
                $match: {
                    customer_id: mongoose.Types.ObjectId(customer_id),
                    ...dateQuery
                }
            },
            {
                $group: {
                    _id: "$transaction_type",
                    total_points: { $sum: "$points" },
                    count: { $sum: 1 },
                    avg_points: { $avg: "$points" }
                }
            }
        ]);

        // Get summary by status
        const summaryByStatus = await Transaction.aggregate([
            {
                $match: {
                    customer_id: mongoose.Types.ObjectId(customer_id),
                    ...dateQuery
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get total points
        const totalPoints = await Transaction.aggregate([
            {
                $match: {
                    customer_id: mongoose.Types.ObjectId(customer_id),
                    ...dateQuery
                }
            },
            {
                $group: {
                    _id: null,
                    total_earned: { $sum: { $cond: [{ $eq: ["$transaction_type", "earn"] }, "$points", 0] } },
                    total_redeemed: { $sum: { $cond: [{ $eq: ["$transaction_type", "redeem"] }, "$points", 0] } },
                    total_expired: { $sum: { $cond: [{ $eq: ["$transaction_type", "expire"] }, "$points", 0] } },
                    total_adjusted: { $sum: { $cond: [{ $eq: ["$transaction_type", "adjust"] }, "$points", 0] } }
                }
            }
        ]);

        return response_handler.success(res, "Transaction summary retrieved successfully", {
            summary_by_type: summaryByType.reduce((acc, curr) => {
                acc[curr._id] = {
                    total_points: curr.total_points,
                    count: curr.count,
                    avg_points: curr.avg_points
                };
                return acc;
            }, {}),
            summary_by_status: summaryByStatus.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            total_points: totalPoints[0] || {
                total_earned: 0,
                total_redeemed: 0,
                total_expired: 0,
                total_adjusted: 0
            }
        });
    } catch (error) {
        logger.error(`Error fetching transaction summary: ${error.message}`);
        return response_handler.error(res, error);
    }
}; 