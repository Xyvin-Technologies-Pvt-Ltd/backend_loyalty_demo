const { logger } = require('../middlewares/logger');
const processExpiredPoints = require('./process_expired_points');

/**
 * Schedule a job to run at a specific time each day
 * @param {Function} job - The job function to run
 * @param {number} hour - Hour of the day (0-23)
 * @param {number} minute - Minute of the hour (0-59)
 * @returns {NodeJS.Timeout} - The timer object
 */
function scheduleDaily(job, hour, minute) {
    const now = new Date();
    let scheduledTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
    );

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilExecution = scheduledTime - now;

    logger.info(`Scheduling job to run at ${scheduledTime.toLocaleTimeString()} (in ${Math.round(timeUntilExecution / 60000)} minutes)`);

    // Schedule the first execution
    const timer = setTimeout(async () => {
        try {
            await job();
        } catch (error) {
            logger.error(`Error executing scheduled job: ${error.message}`, { stack: error.stack });
        }

        // Schedule the job to run again tomorrow
        scheduleDaily(job, hour, minute);
    }, timeUntilExecution);

    return timer;
}

/**
 * Initialize all scheduled jobs
 */
function initializeScheduledJobs() {
    try {
        logger.info('Initializing scheduled jobs');

        // Schedule expired points processing to run at 1:00 AM daily
        scheduleDaily(processExpiredPoints, 1, 0);

        // Add more scheduled jobs here as needed

        logger.info('All jobs scheduled successfully');
    } catch (error) {
        logger.error(`Error initializing scheduled jobs: ${error.message}`, { stack: error.stack });
    }
}

module.exports = {
    initializeScheduledJobs
}; 