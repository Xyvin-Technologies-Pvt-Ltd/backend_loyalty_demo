const mongoose = require("mongoose");

const themeSettingsSchema = new mongoose.Schema(
    {
        // Colors
        primaryColor: {
            type: String,
            default: "#2B5C3F",
        },
        secondaryColor: {
            type: String,
            default: "#4CAF50",
        },
        accentColor: {
            type: String,
            default: "#81C784",
        },
        backgroundColor: {
            type: String,
            default: "#FFFFFF",
        },
        textColor: {
            type: String,
            default: "#1F2937",
        },

        // Typography
        fontFamily: {
            type: String,
            enum: ["Inter", "Roboto", "Open Sans", "Lato", "Poppins"],
            default: "Inter",
        },
        baseFontSize: {
            type: String,
            enum: ["Small (14px)", "Medium (16px)", "Large (18px)"],
            default: "Medium (16px)",
        },

        // Layout
        borderRadius: {
            type: String,
            enum: ["None (0px)", "Small (4px)", "Medium (8px)", "Large (12px)", "Extra Large (16px)"],
            default: "Medium (8px)",
        },
        baseSpacing: {
            type: String,
            enum: ["Compact (12px)", "Normal (16px)", "Relaxed (20px)"],
            default: "Normal (16px)",
        },

        // Preset name if using a preset
        activePreset: {
            type: String,
            enum: ["Default", "Ocean", "Sunset", "Custom"],
            default: "Default",
        },

        // Metadata
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to update lastUpdated
themeSettingsSchema.pre("save", function (next) {
    this.lastUpdated = Date.now();
    next();
});

const ThemeSettings = mongoose.model("ThemeSettings", themeSettingsSchema);

module.exports = ThemeSettings; 