const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversionRuleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        conversionRate: {
            type: Number,
            required: true,
            min: 0.01,
            default: 10, // Default 10 points = 1 coin
            description: 'Number of points required for 1 coin'
        },
        minPointsRequired: {
            type: Number,
            required: true,
            min: 0,
            default: 100,
            description: 'Minimum points required to convert'
        },
        maxPointsPerConversion: {
            type: Number,
            min: 0,
            description: 'Maximum points allowed per conversion (0 for unlimited)'
        },
        bonusPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
            description: 'Bonus percentage added to conversion'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date,
            description: 'End date for this conversion rule (null for no end date)'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin'
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

// Method to check if rule is currently active
conversionRuleSchema.methods.isCurrentlyActive = function () {
    const now = new Date();
    return (
        this.isActive &&
        (!this.endDate || this.endDate > now) &&
        this.startDate <= now
    );
};

// Static method to find all currently active rules
conversionRuleSchema.statics.findActiveRules = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        startDate: { $lte: now },
        $or: [{ endDate: null }, { endDate: { $gt: now } }]
    });
};

// Static method to calculate coins from points using a specific rule
conversionRuleSchema.statics.calculateCoins = function (points, rule) {
    if (!rule || !rule.conversionRate) {
        return { coins: 0, bonus: 0 };
    }

    // Basic conversion
    const baseCoins = Math.floor(points / rule.conversionRate);

    // Calculate bonus
    const bonusCoins = rule.bonusPercentage
        ? Math.floor(baseCoins * (rule.bonusPercentage / 100))
        : 0;

    return {
        coins: baseCoins,
        bonus: bonusCoins,
        total: baseCoins + bonusCoins
    };
};

const ConversionRule = mongoose.model('ConversionRule', conversionRuleSchema);

module.exports = ConversionRule; 