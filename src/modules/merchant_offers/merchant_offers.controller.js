const response_handler = require("../../helpers/response_handler");
const CouponCode = require("../../models/merchant_offers.model");
const validators = require("./merchant_offers.validators");

exports.createPreGeneratedCoupons = async (req, res) => {
    try {
        const { merchantId, coupons, posterImage, description, usageLimit, termsAndConditions, minimumPurchaseAmount, expiryDate, discount, discountType } = req.body;

        const couponDocs = coupons.map(code => ({
            code,
            merchantId,
            type: 'PRE_GENERATED',
            posterImage,
            description,
            usageLimit,
            termsAndConditions,
            minimumPurchaseAmount,
            expiryDate,
            discount,
            discountType
        }));

        const newCoupons = await CouponCode.insertMany(couponDocs);

        return response_handler(
            res,
            201,
            "Pre-generated coupons created successfully!",
            newCoupons
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

exports.generateDynamicCoupon = async (req, res) => {
    try {
        const { merchantId, posterImage, description, usageLimit, termsAndConditions, minimumPurchaseAmount, expiryDate, discount, discountType } = req.body;
        const code = `${merchantId.substr(0, 4)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const coupon = await CouponCode.create({
            code,
            merchantId,
            type: 'DYNAMIC',
            posterImage,
            description,
            usageLimit,
            termsAndConditions,
            minimumPurchaseAmount,
            expiryDate,
            discount,
            discountType
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
        const { merchantId, posterImage, description, usageLimit, termsAndConditions, minimumPurchaseAmount, expiryDate, discount, discountType, redirectUrl } = req.body;
        const code = Math.random().toString(36).substring(2, 15).toUpperCase();

        const coupon = await CouponCode.create({
            code,
            merchantId,
            type: 'ONE_TIME_LINK',
            posterImage,
            description,
            usageLimit,
            termsAndConditions,
            minimumPurchaseAmount,
            expiryDate,
            discount,
            discountType,
            redemptionUrl: `${redirectUrl}?code=${code}`
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
        const { code, merchantId, userId, purchaseAmount } = req.body;

        const coupon = await CouponCode.findOne({
            code,
            merchantId,
            status: { $in: ['UNUSED', 'CLAIMED'] },
            expiryDate: { $gt: new Date() }
        });

        if (!coupon) {
            return response_handler(
                res,
                400,
                "Invalid or expired coupon"
            );
        }

        if (purchaseAmount < coupon.minimumPurchaseAmount) {
            return response_handler(
                res,
                400,
                `Minimum purchase amount of ${coupon.minimumPurchaseAmount} required`
            );
        }

        const now = new Date();
        const userUsageHistory = coupon.usageHistory.filter(usage =>
            usage.userId.toString() === userId.toString()
        );

        if (userUsageHistory.length >= coupon.usageLimit.maxTotalUsage) {
            return response_handler(
                res,
                400,
                "Maximum total usage limit reached"
            );
        }

        let relevantDate;
        switch (coupon.usageLimit.frequency) {
            case 'DAILY':
                relevantDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'WEEKLY':
                relevantDate = new Date(now.setDate(now.getDate() - now.getDay()));
                break;
            case 'BIWEEKLY':
                relevantDate = new Date(now.setDate(now.getDate() - 14));
                break;
            case 'MONTHLY':
                relevantDate = new Date(now.setDate(1));
                break;
        }

        const usageInPeriod = userUsageHistory.filter(usage =>
            usage.usedAt >= relevantDate
        ).length;

        if (usageInPeriod >= coupon.usageLimit.maxUsagePerPeriod) {
            return response_handler(
                res,
                400,
                `Usage limit for this ${coupon.usageLimit.frequency.toLowerCase()} period reached`
            );
        }

        coupon.status = 'REDEEMED';
        coupon.usageHistory.push({ userId, usedAt: new Date() });
        coupon.updatedAt = new Date();
        await coupon.save();

        return response_handler(
            res,
            200,
            "Coupon redeemed successfully",
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
        const { merchantId, status, type } = req.query;

        const query = {};
        if (merchantId) query.merchantId = merchantId;
        if (status) query.status = status;
        if (type) query.type = type;

        const coupons = await CouponCode.find(query).select('-usageHistory');

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
