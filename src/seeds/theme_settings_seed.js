const ThemeSettings = require('../models/theme_settings_model');
const { logger } = require('../middlewares/logger');

/**
 * Seeds the default theme settings if none exist
 */
async function seedThemeSettings() {
    try {
        // Check if any theme settings already exist
        const existingSettings = await ThemeSettings.findOne();

        if (existingSettings) {
            logger.info('Theme settings already exist, skipping seed');
            return;
        }

        // Create default theme settings
        const defaultSettings = ThemeSettings.getDefaults();

        const themeSettings = new ThemeSettings(defaultSettings);
        await themeSettings.save();

        logger.info('Default theme settings seeded successfully');
    } catch (error) {
        logger.error('Error seeding theme settings:', error);
    }
}

module.exports = seedThemeSettings;
