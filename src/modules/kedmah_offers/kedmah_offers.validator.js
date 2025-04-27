const Joi = require("joi");

const kedmahOffersValidationSchema = Joi.object({
  title: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required().allow(""),
  }),
  description: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required().allow(""),
  }),
  posterImage: Joi.string().required(),
  serviceCategory: Joi.string().required(),
  eventType: Joi.string().allow(null),
  offerType: Joi.string().valid("DISCOUNT", "FLAT_OFFER").required(),

  discountDetails: Joi.when("offerType", {
    is: "DISCOUNT",
    then: Joi.object({
      type: Joi.string().valid("PERCENTAGE", "FIXED").required(),
      value: Joi.number().required(),
    }).required(),
    otherwise: Joi.optional(),
  }),

  validityPeriod: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  }).required(),

  redeemablePointsCount: Joi.number().min(0).default(0),

  usagePolicy: Joi.object({
    frequency: Joi.string()
      .valid("DAILY", "WEEKLY", "MONTHLY", "TOTAL")
      .required(),
    maxUsagePerPeriod: Joi.number().min(1).required(),
    maxTotalUsage: Joi.number().allow(null).default(null),
    userLimit: Joi.number().allow(null).default(null),
  }).required(),

  eligibilityCriteria: Joi.object({
    userTypes: Joi.array()
      .items(Joi.string().valid("NEW", "EXISTING", "PREMIUM", "ALL"))
      .default(["ALL"]),
    tiers: Joi.array().items(Joi.string()).required(),
    minTransactionHistory: Joi.number().min(0).default(0),
    minPointsBalance: Joi.number().min(0).default(0),
  }).required(),

  conditions: Joi.object({
    appType: Joi.array(),
    minTransactionValue: Joi.number().min(0).default(0),
    maxTransactionValue: Joi.number().allow(null).default(null),
    applicablePaymentMethods: Joi.array()
      .items(Joi.string().valid("Khedmah-site", "KhedmahPay-Wallet", "ALL"))
      .default(["ALL"]),
  }).default({}),

  termsAndConditions: Joi.array().items(Joi.string()),
  redemptionInstructions: Joi.string().required(),
  isActive: Joi.boolean().default(true),
});

const validateOfferEligibility = Joi.object({
  offerId: Joi.string().required(),
  userId: Joi.string().required(),
  transactionValue: Joi.number().required(),
  paymentMethod: Joi.string()
    .valid("Khedmah-site", "KhedmahPay-Wallet")
    .required(),
});

module.exports = {
  kedmahOffersValidationSchema,
  validateOfferEligibility,
};
