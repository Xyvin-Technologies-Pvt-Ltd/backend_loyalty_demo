/**
 * Express configuration
 * Sets up the Express application with middleware and basic settings
 */

const express = require('express');
const cors = require('cors');
const { request_logger, error_logger } = require('../middlewares/logger');
const { auditMiddleware } = require('../modules/audit');

/**
 * Initialize Express application with common middleware
 * @returns {Object} Configured Express application
 */
function initializeExpress() {
    // Create Express application
    const app = express();

    // Enable Cross-Origin Resource Sharing (CORS)
    app.use(cors());

    // Parse JSON request bodies
    app.use(express.json());

    // Apply request logging middleware
    app.use(request_logger);

    // Apply audit API request logging middleware to all routes
    app.use(auditMiddleware.auditApiRequest());

    // Apply error logging middleware (should be applied after routes)
    app.use(error_logger);

    return app;
}

module.exports = initializeExpress; 