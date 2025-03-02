const Transaction = require('../models/transaction_model');
const { logger } = require('../middlewares/logger');

/**
 * Process expired points job
 * This job should be scheduled to run daily
 */
async function processExpiredPoints() {
    try {
        logger.info('Starting expired points processing job');

        const result = await Transaction.processExpiredPoints();

        logger.info(`Expired points processing completed: ${result.totalExpiredPoints} points expired from ${result.expiredTransactions} transactions affecting ${result.affectedUsers} users`);

        return result;
    } catch (error) {
        logger.error(`Error processing expired points: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

module.exports = processExpiredPoints; 