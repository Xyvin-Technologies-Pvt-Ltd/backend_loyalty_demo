/**
 * Seeds configuration
 * Handles database seeding in development environment
 */

const clc = require('cli-color');
const { logger } = require('../middlewares/logger');

/**
 * Run database seeds in development environment
 * @param {String} nodeEnv - Current Node environment
 */
function runDatabaseSeeds(nodeEnv) {
    // Only run seeds in development mode
    if (nodeEnv === 'development' || !nodeEnv) {
        try {
            const runSeeds = require('../seeds/index');
            runSeeds()
                .then(() => {
                    console.log(clc.greenBright('✓ Database seeded successfully'));
                    logger.info('Database seeded successfully');
                })
                .catch((error) => {
                    console.log(clc.redBright('❌ Error seeding database:'));
                    console.log(clc.bgYellowBright.black(error.message || error));
                    logger.error(`Error seeding database: ${error.message}`, { stack: error.stack });
                });
        } catch (error) {
            console.log(clc.redBright('❌ Error loading seed module:'));
            console.log(clc.bgYellowBright.black(error.message || error));
            logger.error(`Error loading seed module: ${error.message}`, { stack: error.stack });
        }
    }
}

module.exports = {
    runDatabaseSeeds
}; 