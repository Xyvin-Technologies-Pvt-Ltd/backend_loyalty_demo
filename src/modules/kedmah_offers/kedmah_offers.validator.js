const Joi = require("joi");

const kedmahOffersValidationSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    offerType: Joi.string().valid("DISCOUNT", "FREE_SERVICE", "BONUS_POINTS", "EXCLUSIVE_ACCESS").required(),
    posterImage: Joi.string().required(),
    serviceCategory: Joi.string().required(),
    appType: Joi.string().required(),
    eventType: Joi.string().allow(null),

    discountDetails: Joi.when('offerType', {
        is: 'DISCOUNT',
        then: Joi.object({
            type: Joi.string().valid("PERCENTAGE", "FIXED").required(),
            value: Joi.number().required()
        }).required(),
        otherwise: Joi.optional()
    }),

    bonusPoints: Joi.when('offerType', {
        is: 'BONUS_POINTS',
        then: Joi.object({
            value: Joi.number().required()
        }).required(),
        otherwise: Joi.optional()
    }),

    validityPeriod: Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().greater(Joi.ref('startDate')).required()
    }).required(),

    usagePolicy: Joi.object({
        maxUsagePerUser: Joi.number().min(1).required(),
        frequency: Joi.string().valid("DAILY", "WEEKLY", "MONTHLY", "TOTAL").required(),
        userLimit: Joi.number().allow(null)
    }).required(),

    eligibilityCriteria: Joi.object({
        userTypes: Joi.array().items(Joi.string().valid("NEW", "EXISTING", "PREMIUM", "ALL")).required(),
        minTransactionHistory: Joi.number().min(0).default(0),
        minPointsBalance: Joi.number().min(0).default(0)
    }),

    conditions: Joi.object({
        minTransactionValue: Joi.number().min(0).default(0),
        maxTransactionValue: Joi.number().allow(null),
        applicablePaymentMethods: Joi.array().items(
            Joi.string().valid("Khedmah-site", "KhedmahPay-Wallet", "ALL")
        ).default(["ALL"])
    }),

    termsAndConditions: Joi.array().items(Joi.string()),
    redemptionInstructions: Joi.string().required(),
    isActive: Joi.boolean().default(true)
});

const validateOfferEligibility = Joi.object({
    offerId: Joi.string().required(),
    userId: Joi.string().required(),
    transactionValue: Joi.number().required(),
    paymentMethod: Joi.string().valid("Khedmah-site", "KhedmahPay-Wallet").required()
});

module.exports = {
    kedmahOffersValidationSchema,
    validateOfferEligibility
}; 