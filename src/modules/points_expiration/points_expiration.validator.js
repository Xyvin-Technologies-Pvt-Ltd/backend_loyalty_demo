const Joi = require("joi");

const pointsExpirationRulesValidation = Joi.object({
  default_expiry_period: Joi.number()
    .integer()
    .min(0)
    .required()
    .default(0)
    .description("Default expiry period in days"),

  appType: Joi.string().required(),

  tier_extensions: Joi.array().items(
    Joi.object({
      tier_id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .description("Tier ID (MongoDB ObjectId)"),
      additional_months: Joi.number()
        .integer()
        .min(0)
        .required()
        .default(0)
        .description("Additional months based on the tier"),
    })
  ),

  expiry_notifications: Joi.object({
    first_reminder: Joi.number().integer().default(30),
    second_reminder: Joi.number().integer().default(15),
    final_reminder: Joi.number().integer().default(7),
  }),

  grace_period: Joi.number().integer().default(30),

 
});

module.exports = pointsExpirationRulesValidation;
