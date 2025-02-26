const Joi = require("joi");

exports.create_tier = Joi.object({
  name: Joi.string().required(),
  points_required: Joi.number().required(),
  status: Joi.boolean(),
});

exports.update_tier = Joi.object({
  name: Joi.string(),
  points_required: Joi.number(),
  status: Joi.boolean(),
});
