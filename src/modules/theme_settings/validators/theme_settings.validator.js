const Joi = require("joi");

// Validator for updating theme settings
exports.updateThemeSettingsValidator = {
    body: Joi.object({
        primaryColor: Joi.string()
            .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            .description("Primary color in hex format (e.g., #2B5C3F)"),

        secondaryColor: Joi.string()
            .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            .description("Secondary color in hex format (e.g., #4CAF50)"),

        accentColor: Joi.string()
            .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            .description("Accent color in hex format (e.g., #81C784)"),

        backgroundColor: Joi.string()
            .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            .description("Background color in hex format (e.g., #FFFFFF)"),

        textColor: Joi.string()
            .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            .description("Text color in hex format (e.g., #1F2937)"),

        fontFamily: Joi.string()
            .valid("Inter", "Roboto", "Open Sans", "Lato", "Poppins")
            .description("Font family for the application"),

        baseFontSize: Joi.string()
            .valid("Small (14px)", "Medium (16px)", "Large (18px)")
            .description("Base font size for the application"),

        borderRadius: Joi.string()
            .valid("None (0px)", "Small (4px)", "Medium (8px)", "Large (12px)", "Extra Large (16px)")
            .description("Border radius for UI elements"),

        baseSpacing: Joi.string()
            .valid("Compact (12px)", "Normal (16px)", "Relaxed (20px)")
            .description("Base spacing for UI elements"),

        activePreset: Joi.string()
            .valid("Default", "Ocean", "Sunset", "Custom")
            .description("Active color preset")
    })
};

// Validator for applying a preset
exports.applyPresetValidator = {
    params: Joi.object({
        presetName: Joi.string()
            .valid("Default", "Ocean", "Sunset")
            .required()
            .description("Name of the preset to apply")
    })
}; 