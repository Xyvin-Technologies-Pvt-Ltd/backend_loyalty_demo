const Joi = require("joi");

exports.create_criteria = Joi.object({
  category: Joi.string().required(),
  serviceName: Joi.string().required(),
  appType: Joi.string().required(),
  pointSystem: Joi.array().required(),
  isActive: Joi.boolean(),
});

exports.update_criteria = Joi.object({
  category: Joi.string(),
  serviceName: Joi.string(),
  appType: Joi.string(),
  pointSystem: Joi.array(),
  isActive: Joi.boolean(),
});
