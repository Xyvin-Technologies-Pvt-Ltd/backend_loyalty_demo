const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/); // MongoDB ObjectId validation

const pointsCriteriaValidationSchema = Joi.object({
  eventType: objectId.required(),

  serviceType: objectId.required(),

  appType: objectId.required(),
  description: Joi.string().optional(),

  pointSystem: Joi.array()
    .items(
      Joi.object({
        paymentMethod: Joi.string()
          .valid("Khedmah-Pay", "Khedmah-Wallet")
          .required(),
        pointType: Joi.string().valid("percentage", "fixed").required(),
        pointRate: Joi.number().required(),
      })
    )
    .min(1)
    .required(),

  conditions: Joi.object({
    maxTransactions: Joi.object({
      weekly: Joi.number().allow(null),
      monthly: Joi.number().allow(null),
    }).default({}),

    transactionValueLimits: Joi.object({
      minValue: Joi.number().default(0),
      maxValue: Joi.number().allow(null),
    }).default({}),
  }).default({}),

  isActive: Joi.boolean().default(true),
});

module.exports = pointsCriteriaValidationSchema;
