const Joi = require("joi");

/**
 * Validation schema for customer registration
 */
const registerCustomerSchema = Joi.object({
  name: Joi.string().trim().max(100).optional().allow(""),
  email: Joi.string().email().trim().max(100).optional().allow(""),
  mobile: Joi.string().trim().max(20).optional().allow(""),
  customer_id: Joi.string().trim().max(50).required(),
  requested_by: Joi.string().trim().max(100).optional().allow(""),
});

/**
 * Validation schema for viewing customer details
 */
const viewCustomerSchema = Joi.object({
  customer_id: Joi.string().trim().max(50).required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional()
});


/**
 * Validation schema for adding points
 */
const addPointsSchema = Joi.object({
  payment_method: Joi.string().optional(),
  customer_id: Joi.string().trim().max(50).required(),
  transaction_value: Joi.number().positive().precision(2).required(),
  metadata: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          criteria_code: Joi.string().trim().max(50).required(),
          price: Joi.number().positive().precision(2).required(),
          account_no: Joi.string().trim().max(50).optional(),
        })
      )
      .optional(),
  }).optional(),
  transaction_id: Joi.string().trim().max(100).required(),
  requested_by: Joi.string().trim().max(100).optional().allow(""),
});

/**
 * Validation schema for redeeming points
 */
const redeemPointsSchema = Joi.object({
  customer_id: Joi.string().trim().max(50).required(),
  total_spent: Joi.number().positive().precision(2).required(),
  requested_by: Joi.string().trim().max(100).optional().allow(""),
  transaction_id: Joi.string().trim().max(100).required(),
});

/**
 * Validation schema for cancelling redemption
 */
const cancelRedemptionSchema = Joi.object({
  customer_id: Joi.string().trim().max(50).required(),
  transaction_id: Joi.string().trim().max(100).required(),
});

module.exports = {
  registerCustomerSchema,
  viewCustomerSchema,
  addPointsSchema,
  redeemPointsSchema,
  cancelRedemptionSchema,
};
