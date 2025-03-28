const CouponCode = require("../../../models/merchant_offers.model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");

exports.getAvailableOffers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            merchant_id,
            category_id,
            start_date,
            end_date
        } = req.query;

        // Build query for active and valid offers
        const query = {
            status: "UNUSED",
            validityPeriod: {
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            }
        };

        // Add filters if provided
        if (merchant_id) {
            query.merchantId = merchant_id;
        }
        if (category_id) {
            query.couponCategoryId = category_id;
        }
        if (start_date || end_date) {
            query.validityPeriod = {};
            if (start_date) {
                query.validityPeriod.startDate = { $gte: new Date(start_date) };
            }
            if (end_date) {
                query.validityPeriod.endDate = { $lte: new Date(end_date) };
            }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get offers with pagination and populate merchant details
        const offers = await CouponCode.find(query)
            .populate("merchantId", "name logo")
            .populate("couponCategoryId", "name")
            .sort({ validityPeriod: { endDate: 1 } })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await CouponCode.countDocuments(query);

        // Check eligibility for each offer
        const offersWithEligibility = await Promise.all(offers.map(async (offer) => {
            const eligibilityCheck = await offer.checkEligibility(req.user);
            return {
                ...offer.toObject(),
                eligibility: eligibilityCheck
            };
        }));

        return response_handler(res, 200, "Available offers retrieved successfully", {
            offers: offersWithEligibility,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error fetching available offers: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.getOfferDetails = async (req, res) => {
    try {
        const { offer_id } = req.params;
        const { transaction_value, payment_method } = req.query;

        const offer = await CouponCode.findById(offer_id)
            .populate("merchantId", "name logo")
            .populate("couponCategoryId", "name");

        if (!offer) {
            return response_handler(res, 404, "Offer not found", null);
        }

        // Check eligibility if transaction details are provided
        let eligibility = null;
        if (transaction_value && payment_method) {
            eligibility = await offer.checkEligibility(req.user, transaction_value, payment_method);
        }

        return response_handler(res, 200, "Offer details retrieved successfully", {
            ...offer.toObject(),
            eligibility
        });
    } catch (error) {
        logger.error(`Error fetching offer details: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.checkOfferEligibility = async (req, res) => {
    try {
        const { offer_id } = req.params;
        const { transaction_value, payment_method } = req.body;

        if (!transaction_value || !payment_method) {
            return response_handler(res, 400, "Transaction value and payment method are required", null);
        }

        const offer = await CouponCode.findById(offer_id)
            .populate("merchantId", "name logo")
            .populate("couponCategoryId", "name");

        if (!offer) {
            return response_handler(res, 404, "Offer not found", null);
        }

        const eligibility = await offer.checkEligibility(req.user, transaction_value, payment_method);

        return response_handler(res, 200, "Offer eligibility checked successfully", {
            offer_id,
            eligibility
        });
    } catch (error) {
        logger.error(`Error checking offer eligibility: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
};

exports.getMyClaimedOffers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status
        } = req.query;

        // Build query for user's claimed offers
        const query = {
            customerId: req.user._id
        };

        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get claimed offers with pagination
        const offers = await CouponCode.find(query)
            .populate("merchantId", "name logo")
            .populate("couponCategoryId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await CouponCode.countDocuments(query);

        return response_handler(res, 200, "Claimed offers retrieved successfully", {
            offers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error fetching claimed offers: ${error.message}`);
        return response_handler(res, 500, error.message, null);
    }
}; 