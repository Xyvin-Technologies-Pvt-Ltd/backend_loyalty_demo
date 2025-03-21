const Joi = require('joi');

const validators = {
    createPreGeneratedCoupons: Joi.object({
        merchantId: Joi.string().required(),
        coupons: Joi.array().items(Joi.string()).min(1).required(),
        couponCategoryId: Joi.string().required(),
        posterImage: Joi.string().uri().required(),
        description: Joi.string().required(),
        usageLimit: Joi.object({
            frequency: Joi.string().valid('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY').required(),
            maxUsagePerPeriod: Joi.number().min(1).required(),
            maxTotalUsage: Joi.number().min(1).required()
        }).required(),
        termsAndConditions: Joi.array().items(Joi.string()),
        minimumPurchaseAmount: Joi.number().min(0),
        startDate: Joi.date().greater('now').required(),
        expiryDate: Joi.date().greater('now').required(),
        discount: Joi.number().required(),
        discountType: Joi.string().valid('PERCENTAGE', 'FIXED').required()
    }),

    generateDynamicCoupon: Joi.object({
        merchantId: Joi.string().required(),
        couponCategoryId: Joi.string().required(),
        posterImage: Joi.string().uri().required(),
        description: Joi.string().required(),
        usageLimit: Joi.object({
            frequency: Joi.string().valid('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY').required(),
            maxUsagePerPeriod: Joi.number().min(1).required(),
            maxTotalUsage: Joi.number().min(1).required()
        }).required(),
        discount: Joi.number().required(),
        discountType: Joi.string().valid('PERCENTAGE', 'FIXED').required()
    }),

    createOneTimeLink: Joi.object({
        merchantId: Joi.string().required(),
        couponCategoryId: Joi.string().required(),
        posterImage: Joi.string().uri().required(),
        description: Joi.string().required(),
        usageLimit: Joi.object({
            frequency: Joi.string().valid('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY').required(),
            maxUsagePerPeriod: Joi.number().min(1).required(),
            maxTotalUsage: Joi.number().min(1).required()
        }).required(),
        discount: Joi.number().required(),
        discountType: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
        redirectUrl: Joi.string().uri().required()
    }),

    validateCoupon: Joi.object({
        code: Joi.string().required(),
        merchantId: Joi.string().required()
    })
};

module.exports = validators;
