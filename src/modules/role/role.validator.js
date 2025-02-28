const Joi = require("joi");

exports.create_role = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  permissions: Joi.array().required(),
  status: Joi.boolean(),
});

exports.update_role = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  permissions: Joi.array(),
  status: Joi.boolean(),
});
