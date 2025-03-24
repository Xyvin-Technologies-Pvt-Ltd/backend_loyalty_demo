const response_handler = require("../../helpers/response_handler");
const CouponCode = require("../../models/merchant_offers.model");
const Customer = require("../../models/customer_model");     // Assuming you have a user model
const Transaction = require("../../models/transaction_model");
const { logger } = require("../../middlewares/logger"); 

exports.createPreGeneratedCoupons = async (req, res) => {
    try {
        const {
            title, description, posterImage, merchantId, appType, couponCategoryId,
            coupons, validityPeriod, discountDetails, redeemablePointsCount,
            eligibilityCriteria, usagePolicy, conditions, termsAndConditions,
            redemptionInstructions, isActive
        } = req.body;

        const couponDocs = coupons.map(code => ({
            code,
            title,
            description,
            posterImage,
            merchantId,
            appType,
            couponCategoryId,
            type: 'PRE_GENERATED',
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            isActive
        }));

        const newCoupons = await CouponCode.insertMany(couponDocs);
        logger.info(`New coupons created: ${newCoupons.length}`);
        return response_handler(
            res,
            201,
            "Pre-generated coupons created successfully!",
            newCoupons
        );
    } catch (error) {
        logger.error(`Error creating pre-generated coupons: ${error.message}`);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.generateDynamicCoupon = async (req, res) => {
    try {
        const {
            title, description, posterImage, merchantId, appType, couponCategoryId,
            validityPeriod, discountDetails, redeemablePointsCount,
            eligibilityCriteria, usagePolicy, conditions, termsAndConditions,
            redemptionInstructions, isActive
        } = req.body;

        // Generate a unique code with prefix based on merchant ID
        const code = `${merchantId.substr(0, 4)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const coupon = await CouponCode.create({
            code,
            title,
            description,
            posterImage,
            merchantId,
            appType,
            couponCategoryId,
            type: 'DYNAMIC',
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            isActive
        });

        return response_handler(
            res,
            201,
            "Dynamic coupon generated successfully!",
            coupon
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.createOneTimeLink = async (req, res) => {
    try {
        const {
            title, description, posterImage, merchantId, appType, couponCategoryId,
            validityPeriod, discountDetails, redeemablePointsCount,
            eligibilityCriteria, usagePolicy, conditions, termsAndConditions,
            redemptionInstructions, redirectUrl, isActive
        } = req.body;

        // Generate a unique code for the one-time link
        const code = Math.random().toString(36).substring(2, 15).toUpperCase();

        const coupon = await CouponCode.create({
            code,
            title,
            description,
            posterImage,
            merchantId,
            appType,
            couponCategoryId,
            type: 'ONE_TIME_LINK',
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            redemptionUrl: `${redirectUrl}?code=${code}`,
            isActive
        });

        return response_handler(
            res,
            201,
            "One-time link coupon created successfully!",
            coupon
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { code, merchantId, userId, transactionValue, paymentMethod } = req.body;

        // Find the coupon
        const coupon = await CouponCode.findOne({
            code,
            merchantId,
            status: { $in: ['UNUSED', 'CLAIMED'] }
        });

        if (!coupon) {
            return response_handler(
                res,
                400,
                "Invalid coupon code"
            );
        }

        // Find user
        const user = await Customer.findById(userId);
        if (!user) {
            return response_handler(
                res,
                404,
                "User not found"
            );
        }

        // Check eligibility
        const eligibilityCheck = await coupon.checkEligibility(user, transactionValue, paymentMethod);
        if (!eligibilityCheck.eligible) {
            return response_handler(
                res,
                400,
                eligibilityCheck.reason
            );
        }

        //Transaction registration
        const transaction = await Transaction.create({
            userId,
            transactionValue,
            paymentMethod,
            couponId: coupon._id,
            status: 'SUCCESS'
        });

        // Mark as redeemed and update usage history
        coupon.status = 'REDEEMED';
        coupon.usageHistory.push({
            userId,
            usedAt: new Date()
        });
        await coupon.save();

        await transaction.save();

        return response_handler(
            res,
            200,
            "Coupon redeemed successfully",
            {
                coupon: {
                    _id: coupon._id,
                    code: coupon.code,
                    title: coupon.title,
                    discountDetails: coupon.discountDetails
                }
            }
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.checkEligibility = async (req, res) => {
    try {
        const { couponId, customerId, transactionValue, paymentMethod } = req.body;

        // Find the coupon and user
        const coupon = await CouponCode.findById(couponId);
        const customer = await Customer.findById(customerId);

        if (!coupon) {
            return response_handler(
                res,
                404,
                "Coupon not found"
            );
        }

        if (!customer) {
            return response_handler(
                res,
                404,
                "User not found"
            );
        }

        // Check eligibility
        const eligibilityCheck = await coupon.checkEligibility(customer, transactionValue, paymentMethod);

        if (!eligibilityCheck.eligible) {       
            return response_handler(
                res,
                400,
                eligibilityCheck.reason,
                { eligible: false, reason: eligibilityCheck.reason }
            );
        }

        return response_handler(
            res,
            200,
            "User is eligible for this coupon",
            {
                eligible: true,
                coupon: {
                    _id: coupon._id,
                    code: coupon.code,
                    title: coupon.title,
                    description: coupon.description,
                    discountDetails: coupon.discountDetails,
                    validityPeriod: coupon.validityPeriod
                }
            }
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.getCouponDetails = async (req, res) => {
    try {
        const { code } = req.params;
        const coupon = await CouponCode.findOne({ code })
            .select('-usageHistory');

        if (!coupon) {
            return response_handler(
                res,
                404,
                "Coupon not found"
            );
        }

        return response_handler(
            res,
            200,
            "Coupon details fetched successfully!",
            coupon
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.listCoupons = async (req, res) => {
    try {
        const { merchantId, status, type, category, isActive } = req.query;

        const query = {};
        if (merchantId) query.merchantId = merchantId;
        if (status) query.status = status;
        if (type) query.type = type;
        if (category) query.couponCategoryId = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // Only show active coupons that are currently valid
        if (req.query.activeOnly === 'true') {
            query.isActive = true;
            query['validityPeriod.startDate'] = { $lte: new Date() };
            query['validityPeriod.endDate'] = { $gte: new Date() };
        }

        const coupons = await CouponCode.find(query)
            .select('-usageHistory')
            .populate('merchantId', 'name logo')
            .populate('couponCategoryId', 'name');

        return response_handler(
            res,
            200,
            "Coupons fetched successfully!",
            coupons
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};
