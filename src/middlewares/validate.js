/**
 * Request Validation Middleware
 * Validates request data against Joi schemas
 */

const { logger } = require('./logger');

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const data = req[property];
        const options = {
            abortEarly: false, // Include all errors
            allowUnknown: true, // Ignore unknown props
            stripUnknown: true // Remove unknown props
        };

        const { error, value } = schema.validate(data, options);

        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');

            logger.warn(`Validation error: ${errorMessage}`, {
                path: req.path,
                method: req.method,
                property,
                data
            });

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => ({
                    field: detail.context.key,
                    message: detail.message
                }))
            });
        }

        // Replace request data with validated data
        req[property] = value;
        next();
    };
};

module.exports = validate; 