const Joi = require("joi");

exports.create_transaction = Joi.object({
  amount: Joi.number().required(),
  points: Joi.number().required(),
  type: Joi.string().required(),
  merchant: Joi.string().required(),
  status: Joi.string(),
});
