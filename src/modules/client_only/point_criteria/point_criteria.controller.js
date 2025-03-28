const PointsCriteria = require("../../../models/point_criteria_model");
const Transaction = require("../../../models/transaction_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");
const loyaltyPointsController = require("../../loyalty_points_core/loyalty_points.controller");

exports.calculatePoints = async (req, res) => {
    try {
        const {
            unique_code,
            transaction_value,
            payment_method,
            reference_id,
            app_type,
            metadata
        } = req.body;

        // Validate required fields
        if (!unique_code || !transaction_value || !payment_method || !app_type) {
            return response_handler(res, 400, "Missing required fields", null);
        }

        // Call the core process_loyalty_event function
        const result = await loyaltyPointsController.process_loyalty_event({
            body: {
                unique_code,
                paymentMethod: payment_method,
                customerId: req.user._id,
                transactionValue: transaction_value,
                metadata: metadata || {},
                reference_id,
                app_type
            }
        }, res);

        return result;
    } catch (error) {
        logger.error(`Error calculating points: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.getPointCalculationDetails = async (req, res) => {
    try {
        const {
            unique_code,
            transaction_value,
            payment_method,
            app_type
        } = req.query;

        // Validate required fields
        if (!unique_code || !transaction_value || !payment_method || !app_type) {
            return response_handler(res, 400, "Missing required fields", null);
        }

        // Find matching point criteria
        const pointCriteria = await PointsCriteria.findOne({
            unique_code,
            isActive: true
        }).populate("eventType", "name")
            .populate("serviceType", "name")
            .populate("appType", "name");

        if (!pointCriteria) {
            return response_handler(res, 404, "No matching point criteria found", null);
        }

        // Check eligibility
        const eligibilityCheck = await pointCriteria.checkEligibilityOptimized(
            payment_method,
            transaction_value,
            req.user._id
        );

        // Calculate points
        const pointCalculation = pointCriteria.calculatePoints(payment_method, transaction_value);

        return response_handler(res, 200, "Point calculation details retrieved successfully", {
            point_criteria: {
                _id: pointCriteria._id,
                unique_code: pointCriteria.unique_code,
                description: pointCriteria.description,
                event_type: pointCriteria.eventType?.name,
                service_type: pointCriteria.serviceType?.name,
                app_type: pointCriteria.appType?.name
            },
            eligibility: eligibilityCheck,
            calculation: pointCalculation,
            transaction_limits: eligibilityCheck.details.transactionLimits
        });
    } catch (error) {
        logger.error(`Error getting point calculation details: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.getSupportedPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PointsCriteria.getSupportedPaymentMethods();
        return response_handler(res, 200, "Supported payment methods retrieved successfully", {
            payment_methods: paymentMethods
        });
    } catch (error) {
        logger.error(`Error getting supported payment methods: ${error.message}`);
            return response_handler(res, 500, error.message, null);
    }
};

exports.checkCustomerEligibility = async (req, res) => {
    try {
        const {
            unique_code,
            payment_method,
            transaction_value,
            app_type
        } = req.query;

        // Validate required fields
        if (!unique_code || !payment_method || !transaction_value || !app_type) {
            return response_handler(res, 400, "Missing required fields", null);
        }

        // Find matching point criteria
        const pointCriteria = await PointsCriteria.findOne({
            unique_code,
            isActive: true
        }).populate("eventType", "name")
            .populate("serviceType", "name")
            .populate("appType", "name");

        if (!pointCriteria) {
            return response_handler(res, 404, "No matching point criteria found", null);
        }

        // Get customer's transaction history for this criteria
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now);
        startOfMonth.setDate(1);

        const [weeklyTransactions, monthlyTransactions] = await Promise.all([
            Transaction.countDocuments({
                customer_id: req.user._id,
                point_criteria: pointCriteria._id,
                status: "success",
                transaction_type: "earn",
                createdAt: { $gte: startOfWeek }
            }),
            Transaction.countDocuments({
                customer_id: req.user._id,
                point_criteria: pointCriteria._id,
                status: "success",
                transaction_type: "earn",
                createdAt: { $gte: startOfMonth }
            })
        ]);

        // Get total points earned for this criteria
        const totalPoints = await Transaction.aggregate([
            {
                $match: {
                    customer_id: req.user._id,
                    point_criteria: pointCriteria._id,
                    status: "success",
                    transaction_type: "earn"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$points" }
                }
            }
        ]);

        // Check eligibility
        const eligibilityCheck = await pointCriteria.checkEligibilityOptimized(
            payment_method,
            transaction_value,
            req.user._id
        );

        // Calculate potential points
        const pointCalculation = pointCriteria.calculatePoints(payment_method, transaction_value);

                return response_handler(res, 200, "Customer eligibility checked successfully", {
            point_criteria: {
                _id: pointCriteria._id,
                unique_code: pointCriteria.unique_code,
                description: pointCriteria.description,
                event_type: pointCriteria.eventType?.name,
                service_type: pointCriteria.serviceType?.name,
                app_type: pointCriteria.appType?.name
            },
            usage_history: {
                weekly_transactions: weeklyTransactions,
                monthly_transactions: monthlyTransactions,
                total_points_earned: totalPoints[0]?.total || 0,
                weekly_limit: pointCriteria.conditions.maxTransactions.weekly,
                monthly_limit: pointCriteria.conditions.maxTransactions.monthly
            },
            eligibility: eligibilityCheck,
            calculation: pointCalculation,
            transaction_limits: eligibilityCheck.details.transactionLimits
        });
    } catch (error) {
        logger.error(`Error checking customer eligibility: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
}; 