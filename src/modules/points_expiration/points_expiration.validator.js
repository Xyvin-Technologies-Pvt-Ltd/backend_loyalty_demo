const Joi = require("joi");

exports.createOrUpdateRules = Joi.object({
    default_expiry_period: Joi.number().min(1).required()
        .messages({
            'number.base': 'Default expiry period must be a number',
            'number.min': 'Default expiry period must be at least 1 month',
            'any.required': 'Default expiry period is required'
        }),
    tier_extensions: Joi.object({
        silver: Joi.number().min(0).required()
            .messages({
                'number.base': 'Silver tier extension must be a number',
                'number.min': 'Silver tier extension must be at least 0 months',
                'any.required': 'Silver tier extension is required'
            }),
        gold: Joi.number().min(0).required()
            .messages({
                'number.base': 'Gold tier extension must be a number',
                'number.min': 'Gold tier extension must be at least 0 months',
                'any.required': 'Gold tier extension is required'
            }),
        platinum: Joi.number().min(0).required()
            .messages({
                'number.base': 'Platinum tier extension must be a number',
                'number.min': 'Platinum tier extension must be at least 0 months',
                'any.required': 'Platinum tier extension is required'
            })
    }).required()
        .messages({
            'object.base': 'Tier extensions must be an object',
            'any.required': 'Tier extensions are required'
        }),
    expiry_notifications: Joi.object({
        first_reminder: Joi.number().min(1).required()
            .messages({
                'number.base': 'First reminder must be a number',
                'number.min': 'First reminder must be at least 1 day',
                'any.required': 'First reminder is required'
            }),
        second_reminder: Joi.number().min(1).required()
            .messages({
                'number.base': 'Second reminder must be a number',
                'number.min': 'Second reminder must be at least 1 day',
                'any.required': 'Second reminder is required'
            }),
        final_reminder: Joi.number().min(1).required()
            .messages({
                'number.base': 'Final reminder must be a number',
                'number.min': 'Final reminder must be at least 1 day',
                'any.required': 'Final reminder is required'
            })
    }).required()
        .messages({
            'object.base': 'Expiry notifications must be an object',
            'any.required': 'Expiry notifications are required'
        }),
    grace_period: Joi.number().min(0).required()
        .messages({
            'number.base': 'Grace period must be a number',
            'number.min': 'Grace period must be at least 0 days',
            'any.required': 'Grace period is required'
        })
}); 