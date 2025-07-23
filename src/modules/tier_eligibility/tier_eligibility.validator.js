const Joi = require("joi");

// Create tier eligibility criteria validation schema
const createTierEligibilitySchema = {
    body: Joi.object({
        tier_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.pattern.base": "tier_id must be a valid MongoDB ObjectId",
                "any.required": "tier_id is required"
            }),

        net_earning_required: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
                "number.base": "net_earning_required must be a number",
                "number.integer": "net_earning_required must be an integer",
                "number.min": "net_earning_required must be 0 or greater",
                "any.required": "net_earning_required is required"
            }),

        evaluation_period_days: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                "number.base": "evaluation_period_days must be a number",
                "number.integer": "evaluation_period_days must be an integer",
                "number.min": "evaluation_period_days must be at least 1",
                "any.required": "evaluation_period_days is required"
            }),

        consecutive_periods_required: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                "number.base": "consecutive_periods_required must be a number",
                "number.integer": "consecutive_periods_required must be an integer",
                "number.min": "consecutive_periods_required must be at least 1",
                "any.required": "consecutive_periods_required is required"
            }),

        app_type: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .allow(null)
            .optional()
            .messages({
                "string.pattern.base": "app_type must be a valid MongoDB ObjectId"
            }),

        is_active: Joi.boolean()
            .default(true)
            .optional(),

        settings: Joi.object({
            require_consecutive: Joi.boolean()
                .default(true)
                .optional(),

            grace_periods_allowed: Joi.number()
                .integer()
                .min(0)
                .default(0)
                .optional()
                .messages({
                    "number.base": "grace_periods_allowed must be a number",
                    "number.integer": "grace_periods_allowed must be an integer",
                    "number.min": "grace_periods_allowed must be 0 or greater"
                })
        }).optional()
    })
};

// Update tier eligibility criteria validation schema
const updateTierEligibilitySchema = {
    body: Joi.object({
        net_earning_required: Joi.number()
            .integer()
            .min(0)
            .optional()
            .messages({
                "number.base": "net_earning_required must be a number",
                "number.integer": "net_earning_required must be an integer",
                "number.min": "net_earning_required must be 0 or greater"
            }),

        evaluation_period_days: Joi.number()
            .integer()
            .min(1)
            .optional()
            .messages({
                "number.base": "evaluation_period_days must be a number",
                "number.integer": "evaluation_period_days must be an integer",
                "number.min": "evaluation_period_days must be at least 1"
            }),

        consecutive_periods_required: Joi.number()
            .integer()
            .min(1)
            .optional()
            .messages({
                "number.base": "consecutive_periods_required must be a number",
                "number.integer": "consecutive_periods_required must be an integer",
                "number.min": "consecutive_periods_required must be at least 1"
            }),

        app_type: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .allow(null)
            .optional()
            .messages({
                "string.pattern.base": "app_type must be a valid MongoDB ObjectId"
            }),

        is_active: Joi.boolean()
            .optional(),

        settings: Joi.object({
            require_consecutive: Joi.boolean()
                .optional(),

            grace_periods_allowed: Joi.number()
                .integer()
                .min(0)
                .optional()
                .messages({
                    "number.base": "grace_periods_allowed must be a number",
                    "number.integer": "grace_periods_allowed must be an integer",
                    "number.min": "grace_periods_allowed must be 0 or greater"
                })
        }).optional()
    }).min(1) // At least one field must be provided for update
};

// Query validation for get criteria by tier
const getCriteriaForTierSchema = {
    params: Joi.object({
        tier_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.pattern.base": "tier_id must be a valid MongoDB ObjectId",
                "any.required": "tier_id is required"
            })
    }),

    query: Joi.object({
        app_type: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                "string.pattern.base": "app_type must be a valid MongoDB ObjectId"
            })
    })
};

module.exports = {
    createTierEligibilitySchema,
    updateTierEligibilitySchema,
    getCriteriaForTierSchema
}; 