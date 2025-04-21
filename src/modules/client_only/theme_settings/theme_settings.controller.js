const ThemeSettings = require("../../../models/theme_settings_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");

/**
 * Get theme settings for SDK
 * @route GET /api/v1/sdk/theme-settings
 */
exports.getThemeSettings = async (req, res) => {
    try {
        // Get the most recent theme settings or create default if none exists
        let themeSettings = await ThemeSettings.findOne().sort({ createdAt: -1 });

        if (!themeSettings) {
            // Create a new instance with defaults if no theme settings exist
            themeSettings = new ThemeSettings();
            logger.info("Using default theme settings for SDK");
        } else {
            // Transform the document to a plain object to remove unnecessary fields
            themeSettings = themeSettings.toObject();

            // Remove sensitive or unnecessary fields
            delete themeSettings.updatedBy;
            delete themeSettings.__v;
        }

        return response_handler(res, 200, "Theme settings retrieved successfully", {
            theme: {
                colors: {
                    primary: themeSettings.primaryColor,
                    secondary: themeSettings.secondaryColor,
                    accent: themeSettings.accentColor,
                    background: themeSettings.backgroundColor,
                    text: themeSettings.textColor
                },
                typography: {
                    fontFamily: themeSettings.fontFamily,
                    baseFontSize: themeSettings.baseFontSize
                },
                spacing: {
                    baseSpacing: themeSettings.baseSpacing,
                    borderRadius: themeSettings.borderRadius
                },
                preset: themeSettings.activePreset
            }
        });
    } catch (error) {
        logger.error(`Error retrieving theme settings for SDK: ${error.message}`, {
            stack: error.stack,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 