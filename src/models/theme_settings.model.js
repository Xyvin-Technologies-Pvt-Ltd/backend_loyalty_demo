const mongoose = require('mongoose');
const { Schema } = mongoose;

const themeSettingsSchema = new Schema(
    {
        primaryColor: {
            type: String,
            default: '#2B5C3F', // Default green
            validate: {
                validator: function (v) {
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
                },
                message: props => `${props.value} is not a valid hex color!`
            }
        },
        secondaryColor: {
            type: String,
            default: '#4CAF50', // Lighter green
            validate: {
                validator: function (v) {
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
                },
                message: props => `${props.value} is not a valid hex color!`
            }
        },
        accentColor: {
            type: String,
            default: '#81C784', // Even lighter green
            validate: {
                validator: function (v) {
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
                },
                message: props => `${props.value} is not a valid hex color!`
            }
        },
        backgroundColor: {
            type: String,
            default: '#FFFFFF', // White
            validate: {
                validator: function (v) {
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
                },
                message: props => `${props.value} is not a valid hex color!`
            }
        },
        textColor: {
            type: String,
            default: '#1F2937', // Dark gray
            validate: {
                validator: function (v) {
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
                },
                message: props => `${props.value} is not a valid hex color!`
            }
        },
        fontFamily: {
            type: String,
            enum: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins'],
            default: 'Inter'
        },
        baseFontSize: {
            type: String,
            enum: ['Small (14px)', 'Medium (16px)', 'Large (18px)'],
            default: 'Medium (16px)'
        },
        borderRadius: {
            type: String,
            enum: ['None (0px)', 'Small (4px)', 'Medium (8px)', 'Large (12px)', 'Extra Large (16px)'],
            default: 'Medium (8px)'
        },
        baseSpacing: {
            type: String,
            enum: ['Compact (12px)', 'Normal (16px)', 'Relaxed (20px)'],
            default: 'Normal (16px)'
        },
        activePreset: {
            type: String,
            enum: ['Default', 'Ocean', 'Sunset', 'Custom'],
            default: 'Default'
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin'
        }
    },
    {
        timestamps: true
    }
);

// Static method to get default settings
themeSettingsSchema.statics.getDefaults = function () {
    const defaults = {
        primaryColor: '#2B5C3F',
        secondaryColor: '#4CAF50',
        accentColor: '#81C784',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter',
        baseFontSize: 'Medium (16px)',
        borderRadius: 'Medium (8px)',
        baseSpacing: 'Normal (16px)',
        activePreset: 'Default'
    };
    return defaults;
};

// Static method to get preset values
themeSettingsSchema.statics.getPreset = function (presetName) {
    const presets = {
        Default: {
            primaryColor: '#2B5C3F',
            secondaryColor: '#4CAF50',
            accentColor: '#81C784',
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937',
            activePreset: 'Default'
        },
        Ocean: {
            primaryColor: '#1E3A8A',
            secondaryColor: '#3B82F6',
            accentColor: '#93C5FD',
            backgroundColor: '#F0F9FF',
            textColor: '#1E293B',
            activePreset: 'Ocean'
        },
        Sunset: {
            primaryColor: '#9D174D',
            secondaryColor: '#EC4899',
            accentColor: '#FBCFE8',
            backgroundColor: '#FFF1F2',
            textColor: '#1E293B',
            activePreset: 'Sunset'
        }
    };

    return presets[presetName] || null;
};

const ThemeSettings = mongoose.model('ThemeSettings', themeSettingsSchema);

module.exports = ThemeSettings;
