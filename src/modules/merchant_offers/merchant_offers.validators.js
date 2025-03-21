const Joi = require('joi');

const validators = {
    createPreGeneratedCoupons: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        posterImage: Joi.string().required(),
        merchantId: Joi.string().required(),
        appType: Joi.string().required(),
        couponCategoryId: Joi.string().allow(null),
        coupons: Joi.array().items(Joi.string()).min(1).required(),
        validityPeriod: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().greater(Joi.ref('startDate')).required()
        }).required(),
        discountDetails: Joi.object({
            type: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
            value: Joi.number().required()
        }).required(),
        redeemablePointsCount: Joi.number().min(0).default(0),
        eligibilityCriteria: Joi.object({
            userTypes: Joi.array().items(Joi.string().valid('NEW', 'EXISTING', 'PREMIUM', 'ALL')).default(['ALL']),
            tiers: Joi.array().items(Joi.string()),
            minPointsBalance: Joi.number().min(0).default(0),
            minTransactionHistory: Joi.number().min(0).default(0)
        }).default({}),
        usagePolicy: Joi.object({
            frequency: Joi.string().valid('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'TOTAL').required(),
            maxUsagePerPeriod: Joi.number().min(1).required(),
            maxTotalUsage: Joi.number().allow(null).default(null),
            userLimit: Joi.number().allow(null).default(null)
        }).required(),
        conditions: Joi.object({
            minTransactionValue: Joi.number().min(0).default(0),
            maxTransactionValue: Joi.number().allow(null).default(null),
            applicablePaymentMethods: Joi.array().items(
                Joi.string().valid('Khedmah-site', 'KhedmahPay-Wallet', 'ALL')
            ).default(['ALL'])
        }).default({}),
        termsAndConditions: Joi.array().items(Joi.string()),
        redemptionInstructions: Joi.string().allow(''),
        isActive: Joi.boolean().default(true)
    }),

    generateDynamicCoupon: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        posterImage: Joi.string().required(),
        merchantId: Joi.string().required(),
        appType: Joi.string().required(),
        couponCategoryId: Joi.string().allow(null),
        validityPeriod: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().greater(Joi.ref('startDate')).required()
        }).required(),
        discountDetails: Joi.object({
            type: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
            value: Joi.number().required()
        }).required(),
        redeemablePointsCount: Joi.number().min(0).default(0),
        eligibilityCriteria: Joi.object({
            userTypes: Joi.array().items(Joi.string().valid('NEW', 'EXISTING', 'PREMIUM', 'ALL')).default(['ALL']),
            tiers: Joi.array().items(Joi.string()),
            minPointsBalance: Joi.number().min(0).default(0),
            minTransactionHistory: Joi.number().min(0).default(0)
        }).default({}),
        usagePolicy: Joi.object({
            frequency: Joi.string().valid('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'TOTAL').required(),
            maxUsagePerPeriod: Joi.number().min(1).required(),
            maxTotalUsage: Joi.number().allow(null).default(null),
            userLimit: Joi.number().allow(null).default(null)
        }).required(),
        conditions: Joi.object({
            minTransactionValue: Joi.number().min(0).default(0),
            maxTransactionValue: Joi.number().allow(null).default(null),
            applicablePaymentMethods: Joi.array().items(
                Joi.string().valid('Khedmah-site', 'KhedmahPay-Wallet', 'ALL')
            ).default(['ALL'])
        }).default({}),
        termsAndConditions: Joi.array().items(Joi.string()),
        redemptionInstructions: Joi.string().allow(''),
        isActive: Joi.boolean().default(true)
    }),

    createOneTimeLink: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        posterImage: Joi.string().required(),
        merchantId: Joi.string().required(),
        appType: Joi.string().required(),
        couponCategoryId: Joi.string().allow(null),
        validityPeriod: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().greater(Joi.ref('startDate')).required()
        }).required(),
        discountDetails: Joi.object({
            type: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
            value: Joi.number().required()
        }).required(),
        redeemablePointsCount: Joi.number().min(0).default(0),
        eligibilityCriteria: Joi.object({
            userTypes: Joi.array().items(Joi.string().valid('NEW', 'EXISTING', 'PREMIUM', 'ALL')).default(['ALL']),
            tiers: Joi.array().items(Joi.string()),
            minPointsBalance: Joi.number().min(0).default(0),
            minTransactionHistory: Joi.number().min(0).default(0)
        }).default({}),
        usagePolicy: Joi.object({
            frequency: Joi.string().valid('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'TOTAL').required(),
            maxUsagePerPeriod: Joi.number().min(1).required(),
            maxTotalUsage: Joi.number().allow(null).default(null),
            userLimit: Joi.number().allow(null).default(null)
        }).required(),
        conditions: Joi.object({
            minTransactionValue: Joi.number().min(0).default(0),
            maxTransactionValue: Joi.number().allow(null).default(null),
            applicablePaymentMethods: Joi.array().items(
                Joi.string().valid('Khedmah-site', 'KhedmahPay-Wallet', 'ALL')
            ).default(['ALL'])
        }).default({}),
        termsAndConditions: Joi.array().items(Joi.string()),
        redemptionInstructions: Joi.string().allow(''),
        redirectUrl: Joi.string().uri().required(),
        isActive: Joi.boolean().default(true)
    }),

    validateCoupon: Joi.object({
        code: Joi.string().required(),
        merchantId: Joi.string().required(),
        userId: Joi.string().required(),
        transactionValue: Joi.number().required(),
        paymentMethod: Joi.string().valid('Khedmah-site', 'KhedmahPay-Wallet').required()
    }),

    checkEligibility: Joi.object({
        couponId: Joi.string().required(),
        userId: Joi.string().required(),
        transactionValue: Joi.number().required(),
        paymentMethod: Joi.string().valid('Khedmah-site', 'KhedmahPay-Wallet').required()
    })
};

module.exports = validators;
