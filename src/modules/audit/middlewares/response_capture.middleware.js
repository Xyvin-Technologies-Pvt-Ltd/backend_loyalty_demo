/**
 * Response Capture Middleware
 * 
 * This middleware captures response bodies for audit logging.
 * It should be used when you need to log response data in audit logs.
 */

/**
 * Middleware to capture response bodies
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const captureResponse = (options = {}) => {
    const config = {
        // Maximum size of response to capture (in bytes)
        maxSize: options.maxSize || 100 * 1024, // 100KB default

        // Whether to capture binary responses
        captureBinary: options.captureBinary || false,

        // Content types to exclude
        excludeContentTypes: options.excludeContentTypes || [
            'application/octet-stream',
            'image/',
            'video/',
            'audio/'
        ]
    };

    return (req, res, next) => {
        // Store the original methods
        const originalSend = res.send;
        const originalJson = res.json;

        // Override the json method
        res.json = function (body) {
            // Store the response body in res.locals for audit middleware
            res.locals.responseBody = body;

            // Call the original method
            return originalJson.call(this, body);
        };

        // Override the send method
        res.send = function (body) {
            // Only capture if it's not a binary response or binary is allowed
            const contentType = res.get('Content-Type') || '';
            const isBinary = config.excludeContentTypes.some(type => contentType.includes(type));

            if (!isBinary || config.captureBinary) {
                // If it's a string, try to parse it as JSON
                if (typeof body === 'string') {
                    try {
                        const jsonBody = JSON.parse(body);
                        res.locals.responseBody = jsonBody;
                    } catch (e) {
                        // Not JSON, store as string if not too large
                        if (body.length <= config.maxSize) {
                            res.locals.responseBody = body;
                        } else {
                            res.locals.responseBody = '[Response too large to capture]';
                        }
                    }
                } else if (body !== undefined) {
                    // Store the response body in res.locals for audit middleware
                    res.locals.responseBody = body;
                }
            }

            // Call the original method
            return originalSend.call(this, body);
        };

        next();
    };
};

module.exports = captureResponse; 