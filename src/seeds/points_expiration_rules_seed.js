const mongoose = require('mongoose');
const PointsExpirationRules = require('../models/points_expiration_rules_model');
const { logger } = require('../middlewares/logger');

/**
 * Seed points expiration rules data
 */
async function seedPointsExpirationRules() {
    try {
        // Check if points expiration rules already exist
        const existingRules = await PointsExpirationRules.findOne({ is_active: true });

        if (existingRules) {
            logger.info('Points expiration rules already exist, skipping seed');
            return;
        }

        // Create default points expiration rules
        const defaultRules = {
            default_expiry_period: 12, // 12 months
            tier_extensions: [
                {
                    tier_id: "67cc562cf71f32d55006efab", // Silver tier
                    additional_months: 1
                },
                {
                    tier_id: "67cc562cf71f32d55006efac", // Gold tier
                    additional_months: 3
                },
                {
                    tier_id: "67cc562cf71f32d55006efad", // Platinum tier
                    additional_months: 6
                },
            ],
            expiry_notifications: {
                first_reminder: 30, // 30 days before expiry
                second_reminder: 15, // 15 days before expiry
                final_reminder: 5   // 5 days before expiry
            },
            grace_period: 7, // 7 days grace period after expiry
            is_active: true
        };

        await PointsExpirationRules.create(defaultRules);
        logger.info('Points expiration rules seeded successfully');
    } catch (error) {
        logger.error(`Error seeding points expiration rules: ${error.message}`, { stack: error.stack });
    }
}

module.exports = seedPointsExpirationRules; 