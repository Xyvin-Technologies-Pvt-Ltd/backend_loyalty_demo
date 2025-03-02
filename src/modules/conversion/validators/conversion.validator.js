const Joi = require('joi');

// Validator for creating a conversion rule
exports.createConversionRuleValidator = {
    body: Joi.object({
        name: Joi.string()
            .required()
            .trim()
            .description('Name of the conversion rule'),

        description: Joi.string()
            .trim()
            .description('Description of the conversion rule'),

        conversionRate: Joi.number()
            .min(0.01)
            .required()
            .description('Number of points required for 1 coin'),

        minPointsRequired: Joi.number()
            .min(0)
            .required()
            .description('Minimum points required to convert'),

        maxPointsPerConversion: Joi.number()
            .min(0)
            .description('Maximum points allowed per conversion (0 for unlimited)'),

        bonusPercentage: Joi.number()
            .min(0)
            .max(100)
            .description('Bonus percentage added to conversion'),

        startDate: Joi.date()
            .description('Start date for this conversion rule'),

        endDate: Joi.date()
            .greater(Joi.ref('startDate'))
            .description('End date for this conversion rule (null for no end date)'),

        isActive: Joi.boolean()
            .description('Whether the rule is active')
    })
};

// Validator for updating a conversion rule
exports.updateConversionRuleValidator = {
    params: Joi.object({
        id: Joi.string()
            .required()
            .description('ID of the conversion rule to update')
    }),
    body: Joi.object({
        name: Joi.string()
            .trim()
            .description('Name of the conversion rule'),

        description: Joi.string()
            .trim()
            .description('Description of the conversion rule'),

        conversionRate: Joi.number()
            .min(0.01)
            .description('Number of points required for 1 coin'),

        minPointsRequired: Joi.number()
            .min(0)
            .description('Minimum points required to convert'),

        maxPointsPerConversion: Joi.number()
            .min(0)
            .description('Maximum points allowed per conversion (0 for unlimited)'),

        bonusPercentage: Joi.number()
            .min(0)
            .max(100)
            .description('Bonus percentage added to conversion'),

        startDate: Joi.date()
            .description('Start date for this conversion rule'),

        endDate: Joi.date()
            .greater(Joi.ref('startDate'))
            .description('End date for this conversion rule (null for no end date)'),

        isActive: Joi.boolean()
            .description('Whether the rule is active')
    })
};

// Validator for calculating conversion
exports.calculateConversionValidator = {
    body: Joi.object({
        points: Joi.number()
            .required()
            .min(1)
            .description('Number of points to convert'),

        ruleId: Joi.string()
            .description('ID of the conversion rule to use (optional)')
    })
};

// Validator for converting points to coins
exports.convertPointsValidator = {
    body: Joi.object({
        points: Joi.number()
            .required()
            .min(1)
            .description('Number of points to convert'),

        ruleId: Joi.string()
            .description('ID of the conversion rule to use (optional)')
    })
};

// Validator for getting conversion history
exports.getConversionHistoryValidator = {
    query: Joi.object({
        page: Joi.number()
            .min(1)
            .description('Page number for pagination'),

        limit: Joi.number()
            .min(1)
            .max(100)
            .description('Number of items per page'),

        status: Joi.string()
            .valid('pending', 'completed', 'failed', 'cancelled')
            .description('Filter by status'),

        startDate: Joi.date()
            .description('Filter by start date'),

        endDate: Joi.date()
            .greater(Joi.ref('startDate'))
            .description('Filter by end date')
    })
}; 