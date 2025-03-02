const mongoose = require("mongoose");

const points_expiration_rules_schema = new mongoose.Schema(
    {
        default_expiry_period: {
            type: Number,
            required: true,
            default: 12,
            min: 1,
            description: "Default expiry period in months"
        },
        tier_extensions: {
            silver: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
                description: "Additional months for Silver tier"
            },
            gold: {
                type: Number,
                required: true,
                default: 3,
                min: 0,
                description: "Additional months for Gold tier"
            },
            platinum: {
                type: Number,
                required: true,
                default: 6,
                min: 0,
                description: "Additional months for Platinum tier"
            }
        },
        expiry_notifications: {
            first_reminder: {
                type: Number,
                required: true,
                default: 30,
                min: 1,
                description: "Days before expiry for first reminder"
            },
            second_reminder: {
                type: Number,
                required: true,
                default: 15,
                min: 1,
                description: "Days before expiry for second reminder"
            },
            final_reminder: {
                type: Number,
                required: true,
                default: 7,
                min: 1,
                description: "Days before expiry for final reminder"
            }
        },
        grace_period: {
            type: Number,
            required: true,
            default: 30,
            min: 0,
            description: "Grace period in days after expiry"
        },
        is_active: {
            type: Boolean,
            default: true
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        }
    },
    { timestamps: true }
);

// We'll only have one active expiration rule configuration at a time
points_expiration_rules_schema.statics.getActiveRules = async function () {
    return this.findOne({ is_active: true });
};

// Calculate expiry date based on user's tier
points_expiration_rules_schema.statics.calculateExpiryDate = async function (tierName) {
    const rules = await this.getActiveRules();
    if (!rules) {
        // Default to 12 months if no rules are set
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 12);
        return expiryDate;
    }

    const expiryDate = new Date();
    let totalMonths = rules.default_expiry_period;

    // Add tier-based extension if applicable
    if (tierName) {
        const tierLower = tierName.toLowerCase();
        if (tierLower === 'silver' && rules.tier_extensions.silver) {
            totalMonths += rules.tier_extensions.silver;
        } else if (tierLower === 'gold' && rules.tier_extensions.gold) {
            totalMonths += rules.tier_extensions.gold;
        } else if (tierLower === 'platinum' && rules.tier_extensions.platinum) {
            totalMonths += rules.tier_extensions.platinum;
        }
    }

    expiryDate.setMonth(expiryDate.getMonth() + totalMonths);
    return expiryDate;
};

const PointsExpirationRules = mongoose.model("PointsExpirationRules", points_expiration_rules_schema);

module.exports = PointsExpirationRules; 