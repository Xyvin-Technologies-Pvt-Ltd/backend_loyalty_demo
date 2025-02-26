const Joi = require("joi");

exports.create_criteria = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  point: Joi.number().required(),
  amount: Joi.number().required(),
  status: Joi.boolean(),
});

exports.update_criteria = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  type: Joi.string(),
  point: Joi.number(),
  amount: Joi.number(),
  status: Joi.boolean(),
});
