const ThemeSettings = require("../../../models/theme_settings_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");
const { AuditService } = require("../../audit");

/**
 * Get theme settings
 * @route GET /api/v1/theme-settings
 */
exports.getThemeSettings = async (req, res) => {
    try {
        // Get the most recent theme settings or create default if none exists
        let themeSettings = await ThemeSettings.findOne().sort({ createdAt: -1 });

        if (!themeSettings) {
            themeSettings = await ThemeSettings.create({});
            logger.info("Created default theme settings");
        }

        return response_handler(res, 200, "Theme settings retrieved successfully", themeSettings);
    } catch (error) {
        logger.error(`Error retrieving theme settings: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "get_theme_settings",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error retrieving theme settings",
            errorMessage: error.message,
            stackTrace: error.stack,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Update theme settings
 * @route PUT /api/v1/theme-settings
 */
exports.updateThemeSettings = async (req, res) => {
    try {
        // Get the current theme settings or create default if none exists
        let themeSettings = await ThemeSettings.findOne().sort({ createdAt: -1 });
        const originalSettings = themeSettings ? { ...themeSettings.toObject() } : null;

        if (!themeSettings) {
            themeSettings = new ThemeSettings({});
        }

        // Update fields from request body
        const updateFields = [
            "primaryColor", "secondaryColor", "accentColor", "backgroundColor", "textColor",
            "fontFamily", "baseFontSize", "borderRadius", "baseSpacing", "activePreset"
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                themeSettings[field] = req.body[field];
            }
        });

        // Set updatedBy to current admin
        if (req.admin) {
            themeSettings.updatedBy = req.admin._id;
        }

        // Save the updated settings
        await themeSettings.save();

        // Log admin action
        if (req.admin) {
            await AuditService.logAdminAction({
                action: "update_theme_settings",
                user: req.admin._id,
                userModel: "Admin",
                userName: req.admin.name,
                userEmail: req.admin.email,
                targetId: themeSettings._id,
                targetModel: "ThemeSettings",
                description: "Admin updated theme settings",
                before: originalSettings,
                after: themeSettings.toObject(),
            });
        }

        return response_handler(res, 200, "Theme settings updated successfully", themeSettings);
    } catch (error) {
        logger.error(`Error updating theme settings: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "update_theme_settings",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error updating theme settings",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Reset theme settings to defaults
 * @route POST /api/v1/theme-settings/reset
 */
exports.resetThemeSettings = async (req, res) => {
    try {
        // Get the current theme settings
        const currentSettings = await ThemeSettings.findOne().sort({ createdAt: -1 });
        const originalSettings = currentSettings ? { ...currentSettings.toObject() } : null;

        // Create new settings with defaults
        const themeSettings = new ThemeSettings({
            updatedBy: req.admin ? req.admin._id : null,
        });

        // Save the new default settings
        await themeSettings.save();

        // If there was a previous settings document, we can optionally delete it
        // or keep it for history purposes

        // Log admin action
        if (req.admin) {
            await AuditService.logAdminAction({
                action: "reset_theme_settings",
                user: req.admin._id,
                userModel: "Admin",
                userName: req.admin.name,
                userEmail: req.admin.email,
                targetId: themeSettings._id,
                targetModel: "ThemeSettings",
                description: "Admin reset theme settings to defaults",
                before: originalSettings,
                after: themeSettings.toObject(),
            });
        }

        return response_handler(res, 200, "Theme settings reset to defaults successfully", themeSettings);
    } catch (error) {
        logger.error(`Error resetting theme settings: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "reset_theme_settings",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error resetting theme settings",
            errorMessage: error.message,
            stackTrace: error.stack,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Apply a color preset
 * @route POST /api/v1/theme-settings/preset/:presetName
 */
exports.applyPreset = async (req, res) => {
    try {
        const { presetName } = req.params;

        // Get the current theme settings or create new
        let themeSettings = await ThemeSettings.findOne().sort({ createdAt: -1 });
        const originalSettings = themeSettings ? { ...themeSettings.toObject() } : null;

        if (!themeSettings) {
            themeSettings = new ThemeSettings({});
        }

        // Define presets
        const presets = {
            Default: {
                primaryColor: "#2B5C3F",
                secondaryColor: "#4CAF50",
                accentColor: "#81C784",
                backgroundColor: "#FFFFFF",
                textColor: "#1F2937",
                activePreset: "Default"
            },
            Ocean: {
                primaryColor: "#1565C0",
                secondaryColor: "#42A5F5",
                accentColor: "#90CAF9",
                backgroundColor: "#FFFFFF",
                textColor: "#1F2937",
                activePreset: "Ocean"
            },
            Sunset: {
                primaryColor: "#C2185B",
                secondaryColor: "#E91E63",
                accentColor: "#F48FB1",
                backgroundColor: "#FFFFFF",
                textColor: "#1F2937",
                activePreset: "Sunset"
            }
        };

        // Check if preset exists
        if (!presets[presetName]) {
            return response_handler(res, 400, `Invalid preset name: ${presetName}`);
        }

        // Apply preset
        Object.keys(presets[presetName]).forEach(key => {
            themeSettings[key] = presets[presetName][key];
        });

        // Set updatedBy to current admin
        if (req.admin) {
            themeSettings.updatedBy = req.admin._id;
        }

        // Save the updated settings
        await themeSettings.save();

        // Log admin action
        if (req.admin) {
            await AuditService.logAdminAction({
                action: "apply_theme_preset",
                user: req.admin._id,
                userModel: "Admin",
                userName: req.admin.name,
                userEmail: req.admin.email,
                targetId: themeSettings._id,
                targetModel: "ThemeSettings",
                description: `Admin applied ${presetName} theme preset`,
                before: originalSettings,
                after: themeSettings.toObject(),
            });
        }

        return response_handler(res, 200, `${presetName} preset applied successfully`, themeSettings);
    } catch (error) {
        logger.error(`Error applying theme preset: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "apply_theme_preset",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error applying theme preset",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: { presetName: req.params.presetName },
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 