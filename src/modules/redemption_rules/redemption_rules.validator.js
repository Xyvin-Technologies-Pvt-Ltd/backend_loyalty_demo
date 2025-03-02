const Joi = require("joi");

exports.createOrUpdateRules = Joi.object({
    minimum_points_required: Joi.number().min(1).required()
        .messages({
            'number.base': 'Minimum points required must be a number',
            'number.min': 'Minimum points required must be at least 1',
            'any.required': 'Minimum points required is required'
        }),
    maximum_points_per_day: Joi.number().min(1).required()
        .messages({
            'number.base': 'Maximum points per day must be a number',
            'number.min': 'Maximum points per day must be at least 1',
            'any.required': 'Maximum points per day is required'
        }),
    tier_multipliers: Joi.object({
        silver: Joi.number().min(0.1).required()
            .messages({
                'number.base': 'Silver tier multiplier must be a number',
                'number.min': 'Silver tier multiplier must be at least 0.1',
                'any.required': 'Silver tier multiplier is required'
            }),
        gold: Joi.number().min(0.1).required()
            .messages({
                'number.base': 'Gold tier multiplier must be a number',
                'number.min': 'Gold tier multiplier must be at least 0.1',
                'any.required': 'Gold tier multiplier is required'
            }),
        platinum: Joi.number().min(0.1).required()
            .messages({
                'number.base': 'Platinum tier multiplier must be a number',
                'number.min': 'Platinum tier multiplier must be at least 0.1',
                'any.required': 'Platinum tier multiplier is required'
            })
    }).required()
        .messages({
            'object.base': 'Tier multipliers must be an object',
            'any.required': 'Tier multipliers are required'
        })
});

exports.validateRedemption = Joi.object({
    user_id: Joi.string().required()
        .messages({
            'string.base': 'User ID must be a string',
            'any.required': 'User ID is required'
        }),
    points_to_redeem: Joi.number().min(1).required()
        .messages({
            'number.base': 'Points to redeem must be a number',
            'number.min': 'Points to redeem must be at least 1',
            'any.required': 'Points to redeem is required'
        }),
    reward_type: Joi.string().required()
        .messages({
            'string.base': 'Reward type must be a string',
            'any.required': 'Reward type is required'
        }),
    reward_details: Joi.object().required()
        .messages({
            'object.base': 'Reward details must be an object',
            'any.required': 'Reward details are required'
        })
});

exports.updateTransactionStatus = Joi.object({
    status: Joi.string().valid('pending', 'completed', 'rejected', 'cancelled').required()
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Status must be one of: pending, completed, rejected, cancelled',
            'any.required': 'Status is required'
        }),
    notes: Joi.string()
        .messages({
            'string.base': 'Notes must be a string'
        })
}); 