const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/); // MongoDB ObjectId validation

const pointsCriteriaValidationSchema = Joi.object({
  eventType: objectId.required(),

  serviceType: objectId.required(),

  appType: objectId.required(),
  description: Joi.string().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  pointSystem: Joi.array()
    .items(
      Joi.object({
        pointType: Joi.string().valid("percentage", "fixed").required(),
        pointRate: Joi.number().required(),
        paymentMethod: Joi.string(),
      })
    )
    .min(1),

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
