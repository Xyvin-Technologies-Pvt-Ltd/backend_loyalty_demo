const Joi = require("joi");

const loyalty_points_validator = Joi.object({
  customer_id: Joi.string().required(),
  points: Joi.number().required(),
  transaction_id: Joi.string().required(),
});

module.exports = loyalty_points_validator;
