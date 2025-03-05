/**
 * Transaction Validators
 * Defines validation schemas for transaction operations
 */

const Joi = require('joi');

// Create transaction validation schema
exports.createTransaction = Joi.object({
    user: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
            'any.required': 'User ID is required'
        }),

    amount: Joi.number()
        .required()
        .positive()
        .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be a positive number',
            'any.required': 'Amount is required'
        }),

    type: Joi.string()
        .required()
        .valid('EARN', 'REDEEM', 'EXPIRE', 'ADJUST')
        .messages({
            'string.base': 'Type must be a string',
            'any.only': 'Type must be one of: EARN, REDEEM, EXPIRE, ADJUST',
            'any.required': 'Type is required'
        }),

    status: Joi.string()
        .valid('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
        .default('COMPLETED')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Status must be one of: PENDING, COMPLETED, FAILED, CANCELLED'
        }),

    description: Joi.string()
        .max(500)
        .messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description cannot exceed 500 characters'
        }),

    metadata: Joi.object()
        .messages({
            'object.base': 'Metadata must be an object'
        }),

    notes: Joi.string()
        .max(1000)
        .messages({
            'string.base': 'Notes must be a string',
            'string.max': 'Notes cannot exceed 1000 characters'
        }),

    reference: Joi.string()
        .max(100)
        .messages({
            'string.base': 'Reference must be a string',
            'string.max': 'Reference cannot exceed 100 characters'
        })
});

// Update transaction status validation schema
exports.updateTransactionStatus = Joi.object({
    status: Joi.string()
        .required()
        .valid('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Status must be one of: PENDING, COMPLETED, FAILED, CANCELLED',
            'any.required': 'Status is required'
        }),

    notes: Joi.string()
        .max(1000)
        .messages({
            'string.base': 'Notes must be a string',
            'string.max': 'Notes cannot exceed 1000 characters'
        })
});

// Get transactions query validation schema
exports.getTransactionsQuery = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),

    sortBy: Joi.string()
        .valid('createdAt', 'amount', 'type', 'status')
        .default('createdAt')
        .messages({
            'string.base': 'Sort field must be a string',
            'any.only': 'Sort field must be one of: createdAt, amount, type, status'
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .messages({
            'string.base': 'Sort order must be a string',
            'any.only': 'Sort order must be one of: asc, desc'
        }),

    type: Joi.string()
        .valid('EARN', 'REDEEM', 'EXPIRE', 'ADJUST')
        .messages({
            'string.base': 'Type must be a string',
            'any.only': 'Type must be one of: EARN, REDEEM, EXPIRE, ADJUST'
        }),

    status: Joi.string()
        .valid('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Status must be one of: PENDING, COMPLETED, FAILED, CANCELLED'
        }),

    minAmount: Joi.number()
        .min(0)
        .messages({
            'number.base': 'Minimum amount must be a number',
            'number.min': 'Minimum amount cannot be negative'
        }),

    maxAmount: Joi.number()
        .min(0)
        .messages({
            'number.base': 'Maximum amount must be a number',
            'number.min': 'Maximum amount cannot be negative'
        }),

    startDate: Joi.date()
        .iso()
        .messages({
            'date.base': 'Start date must be a valid date',
            'date.format': 'Start date must be in ISO format'
        }),

    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .messages({
            'date.base': 'End date must be a valid date',
            'date.format': 'End date must be in ISO format',
            'date.min': 'End date must be after start date'
        })
}); 