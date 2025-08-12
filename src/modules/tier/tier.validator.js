const Joi = require("joi");

exports.create_tier = Joi.object({
  name: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required().allow(""),
  }).required(),
  points_required: Joi.number().required(),
  hierarchy_level: Joi.number()
    .integer()
    .min(0)
    .required()
    .description("Hierarchy level of the tier (0 being the lowest)"),
  description: Joi.object({
    en: Joi.array().items(Joi.string()).required(),
    ar: Joi.array().items(Joi.string()).required(),
  }),
  isActive: Joi.boolean(),
  tier_point_multiplier: Joi.array().items(
    Joi.object({
      appType: Joi.string().required(),
      multiplier: Joi.number().required(),
    })
  ),
});

exports.update_tier = Joi.object({
  name: Joi.object({
    en: Joi.string(),
    ar: Joi.string().allow(""),
  }),
  points_required: Joi.number(),
  hierarchy_level: Joi.number()
    .integer()
    .min(0)
    .description("Hierarchy level of the tier (0 being the lowest)"),
  description: Joi.object({
    en: Joi.array().items(Joi.string()),
    ar: Joi.array().items(Joi.string()),
  }),
  isActive: Joi.boolean(),
  tier_point_multiplier: Joi.array().items(
    Joi.object({
      appType: Joi.string(),
      multiplier: Joi.number(),
    })
  ),
});
