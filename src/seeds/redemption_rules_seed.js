const mongoose = require('mongoose');
const RedemptionRules = require('../models/redemption_rules_model');
const { logger } = require('../middlewares/logger');

/**
 * Seed redemption rules data
 */
async function seedRedemptionRules() {
    try {
        // Check if redemption rules already exist
        const existingRules = await RedemptionRules.findOne({ is_active: true });

        if (existingRules) {
            logger.info('Redemption rules already exist, skipping seed');
            return;
        }

        // Create default redemption rules
        const defaultRules = {
            minimum_points_required: 100,
            maximum_points_per_day: 1000,
            tier_multipliers: {
                silver: 1,
                gold: 1.5,
                platinum: 2
            },
            is_active: true
        };

        await RedemptionRules.create(defaultRules);
        logger.info('Redemption rules seeded successfully');
    } catch (error) {
        logger.error(`Error seeding redemption rules: ${error.message}`, { stack: error.stack });
    }
}

module.exports = seedRedemptionRules; 