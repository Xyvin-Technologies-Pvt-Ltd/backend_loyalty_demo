/**
 * Express configuration
 * Sets up the Express application with middleware and basic settings
 */

const express = require('express');
const cors = require('cors');
const { request_logger, error_logger } = require('../middlewares/logger');
const { auditMiddleware } = require('../modules/audit');
const helmet = require("helmet");
const { xss } = require('express-xss-sanitizer');
const compression = require("compression");
const { env } = require("./env");
/**
 * Initialize Express application with common middleware
 * @returns {Object} Configured Express application
 */
function initializeExpress() {
    // Create Express application
    const app = express();
    // Set security HTTP headers
    app.use(helmet());

    // Compress response bodies
    app.use(compression());

    // Enable Cross-Origin Resource Sharing (CORS)
    app.use(cors());

    // Parse JSON request bodies
    app.use(express.json());


    // Parse URL-encoded request body
    app.use(express.urlencoded({ extended: true }));

    // Sanitize request data against XSS
    app.use(xss());


    // Apply request logging middleware
    app.use(request_logger);

    // Apply audit API request logging middleware to all routes
    app.use(auditMiddleware.auditApiRequest());

    // Apply error logging middleware (should be applied after routes)
    app.use(error_logger);

    // Add rate limiting
    if (env === "production") {
        const rateLimit = require("express-rate-limit");
        app.use(
            rateLimit({
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100, // limit each IP to 100 requests per windowMs
                message: "Too many requests from this IP, please try again later",
            })
        );
    }


    return app;
}

module.exports = initializeExpress; 