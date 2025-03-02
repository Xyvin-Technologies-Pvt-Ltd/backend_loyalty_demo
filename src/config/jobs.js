/**
 * Jobs configuration
 * Handles initialization of scheduled jobs
 */

const { initializeScheduledJobs } = require('../jobs/scheduler');
const { logger } = require('../middlewares/logger');

/**
 * Initialize scheduled jobs
 */
function startScheduledJobs() {
    try {
        initializeScheduledJobs();
        logger.info('Scheduled jobs initialized');
    } catch (error) {
        logger.error(`Error initializing scheduled jobs: ${error.message}`, { stack: error.stack });
    }
}

module.exports = {
    startScheduledJobs
}; 