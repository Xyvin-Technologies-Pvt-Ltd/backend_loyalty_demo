const response_handler = require("../../helpers/response_handler");
const CouponCode = require("../../models/merchant_offers.model");
const { validateCouponCreation, validateCouponUpdate } = require('./merchant_offers.validators');
const { v4: uuidv4 } = require('uuid');


// Create a single coupon
exports.createCoupon = async (req, res) => {
    try {
        const { error } = validateCouponCreation(req.body);
        if (error) {
            return response_handler(res, 400, false, error.details[0].message);
        }

        const {
            title,
            description,
            posterImage,
            merchantId,
            couponCategoryId,
            type,
            code,
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            redemptionUrl,
            linkData
        } = req.body;

        // Validate type-specific requirements
        if (type === 'PRE_GENERATED' && !code) {
            return response_handler(res, 400, false, 'Code is required for PRE_GENERATED type');
        }

        if (type === 'ONE_TIME_LINK' && !redemptionUrl) {
            return response_handler(res, 400, false, 'Redemption URL is required for ONE_TIME_LINK type');
        }

        const coupon = new CouponCode({
            title,
            description,
            posterImage,
            merchantId,
            couponCategoryId,
            type,
            code: type === 'DYNAMIC' ? uuidv4().substring(0, 4) : code,
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            redemptionUrl,
            linkData
        });

        await coupon.save();
        return response_handler(res, 201, true, 'Coupon created successfully', coupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        return response_handler(res, 500, false, 'Error creating coupon');
    }
};

// Create bulk coupons with pre-generated codes
exports.createBulkCoupons = async (req, res) => {
    try {
        const { error } = validateCouponCreation(req.body);
        if (error) {
            return response_handler(res, 400, false, error.details[0].message);
        }

        const {
            title,
            description,
            posterImage,
            merchantId,
            couponCategoryId,
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            codes // Array of pre-generated codes
        } = req.body;

        if (!codes || !Array.isArray(codes) || codes.length === 0) {
            return response_handler(res, 400, false, 'Pre-generated codes are required for bulk creation');
        }

        const batchId = uuidv4();
        const coupons = codes.map(code => ({
            title,
            description,
            posterImage,
            merchantId,
            couponCategoryId,
            type: 'PRE_GENERATED',
            code,
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            batchId
        }));

        const createdCoupons = await CouponCode.insertMany(coupons);
        return response_handler(res, 201, true, 'Bulk coupons created successfully', {
            batchId,
            count: createdCoupons.length,
            coupons: createdCoupons
        });
    } catch (error) {
        console.error('Error creating bulk coupons:', error);
        return response_handler(res, 500, false, 'Error creating bulk coupons');
    }
};

// Create a one-time link coupon
exports.createOneTimeLinkCoupon = async (req, res) => {
    try {
        const { error } = validateCouponCreation(req.body);
        if (error) {
            return response_handler(res, 400, false, error.details[0].message);
        }

        const {
            title,
            description,
            posterImage,
            merchantId,
            couponCategoryId,
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionUrl,
            linkData
        } = req.body;

        if (!redemptionUrl) {
            return response_handler(res, 400, false, 'Redemption URL is required for one-time link coupons');
        }

        const coupon = new CouponCode({
            title,
            description,
            posterImage,
            merchantId,
            couponCategoryId,
            type: 'ONE_TIME_LINK',
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionUrl,
            linkData
        });

        await coupon.save();
        return response_handler(res, 201, true, 'One-time link coupon created successfully', coupon);
    } catch (error) {
        console.error('Error creating one-time link coupon:', error);
        return response_handler(res, 500, false, 'Error creating one-time link coupon');
    }
};

// Get coupons by batch ID
exports.getCouponsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const coupons = await CouponCode.find({ batchId })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await CouponCode.countDocuments({ batchId });

        return response_handler(res, 200, true, 'Coupons retrieved successfully', {
            coupons,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error retrieving coupons by batch:', error);
        return response_handler(res, 500, false, 'Error retrieving coupons by batch');
    }
};


exports.getCouponDetails = async (req, res) => {
    try {
        const { couponId } = req.params;
        const coupon = await CouponCode.findById(couponId);
        return response_handler(res, 200, true, 'Coupon details retrieved successfully', coupon);
    } catch (error) {
        console.error('Error retrieving coupon details:', error);
        return response_handler(res, 500, false, 'Error retrieving coupon details');
    }
};


exports.getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const coupons = await CouponCode.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await CouponCode.countDocuments();

        return response_handler(res, 200, true, 'All coupons retrieved successfully', {
            coupons,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error retrieving all coupons:', error);
        return response_handler(res, 500, false, 'Error retrieving all coupons');
    }
};


exports.updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const { error } = validateCouponUpdate(req.body);
        if (error) {
            return response_handler(res, 400, false, error.details[0].message);
        }

        const {
            title,
            description,
            posterImage,
            merchantId,
            couponCategoryId,
            validityPeriod,
            discountDetails,
            redeemablePointsCount,
            eligibilityCriteria,
            usagePolicy,
            conditions,
            termsAndConditions,
            redemptionInstructions,
            redemptionUrl,
            linkData
        } = req.body;

        const coupon = await CouponCode.findByIdAndUpdate(couponId, {
            $set: {
                title,
                description,
                posterImage,
                merchantId,
                couponCategoryId,
                validityPeriod,
                discountDetails,
                redeemablePointsCount,
                eligibilityCriteria,
                usagePolicy,
                conditions,
                termsAndConditions,
                redemptionInstructions,
                redemptionUrl,
                linkData
            }
        });

        return response_handler(res, 200, true, 'Coupon updated successfully', coupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        return response_handler(res, 500, false, 'Error updating coupon');
    }
};


exports.deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        await CouponCode.findByIdAndDelete(couponId);
        return response_handler(res, 200, true, 'Coupon deleted successfully');
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return response_handler(res, 500, false, 'Error deleting coupon');
    }
};


