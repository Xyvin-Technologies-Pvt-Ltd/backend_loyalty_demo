const Joi = require("joi");

exports.signup = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  status: Joi.boolean(),
  password: Joi.string(),
});

exports.login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.register = Joi.object({
  customer_id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  status: Joi.boolean(),
  refer_code: Joi.string(),
});
