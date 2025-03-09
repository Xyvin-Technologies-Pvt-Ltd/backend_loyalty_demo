const Joi = require("joi");

exports.create_tier = Joi.object({
  name: Joi.string().required(),
  points_required: Joi.number().required(),
  description: Joi.array().items(Joi.string()).required(),
  isActive: Joi.boolean(),
});

exports.update_tier = Joi.object({
  name: Joi.string(),
  points_required: Joi.number(),
  description: Joi.array().items(Joi.string()),
  isActive: Joi.boolean(),
});
