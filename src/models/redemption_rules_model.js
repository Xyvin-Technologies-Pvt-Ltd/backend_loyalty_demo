const mongoose = require("mongoose");

const redemption_rules_schema = new mongoose.Schema(
    {
        minimum_points_required: {
            type: Number,
            required: true,
            default: 100
        },
        maximum_points_per_day: {
            type: Number,
            required: true,
            default: 1000
        },
        tier_multipliers:[
            {
                _id:false,
                tier_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tier"
                },
                multiplier: {
                    type: Number,
                    required: true,
                    default: 1
                }
            }
        ],
        is_active: {
            type: Boolean,
            default: true
        },
       
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        }
    },
    { timestamps: true }
);

// We'll only have one active redemption rule configuration at a time
redemption_rules_schema.statics.getActiveRules = async function () {
    return this.findOne({ is_active: true });
};

const RedemptionRules = mongoose.model("RedemptionRules", redemption_rules_schema);

module.exports = RedemptionRules; 