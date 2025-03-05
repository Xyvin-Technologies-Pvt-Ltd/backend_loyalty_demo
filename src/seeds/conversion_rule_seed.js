const ConversionRule = require('../models/conversion_rule_model');
const { logger } = require('../middlewares/logger');

/**
 * Seeds default conversion rules if none exist
 */
async function seedConversionRules() {
    try {
        // Check if any conversion rules already exist
        const existingRules = await ConversionRule.countDocuments();

        if (existingRules > 0) {
            logger.info('Conversion rules already exist, skipping seed');
            return;
        }

        // Default conversion rules
        const defaultRules = [
            {
                name: 'Standard Conversion',
                description: 'Standard points to coins conversion rate',
                conversionRate: 10, // 10 points = 1 coin
                minPointsRequired: 100,
                maxPointsPerConversion: 0, // No limit
                bonusPercentage: 0,
                isActive: true
            },
            {
                name: 'Premium Conversion',
                description: 'Premium conversion rate with bonus',
                conversionRate: 8, // 8 points = 1 coin (better rate)
                minPointsRequired: 1000,
                maxPointsPerConversion: 0, // No limit
                bonusPercentage: 10, // 10% bonus
                isActive: true
            },
            {
                name: 'Bulk Conversion',
                description: 'Special rate for bulk conversions with higher bonus',
                conversionRate: 10,
                minPointsRequired: 5000,
                maxPointsPerConversion: 0, // No limit
                bonusPercentage: 20, // 20% bonus
                isActive: true
            }
        ];

        // Insert the default rules
        await ConversionRule.insertMany(defaultRules);

        logger.info(`Seeded ${defaultRules.length} default conversion rules`);
    } catch (error) {
        logger.error('Error seeding conversion rules:', error);
    }
}

module.exports = seedConversionRules; 