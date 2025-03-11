const mongoose = require("mongoose");

const points_expiration_rules_schema = new mongoose.Schema(
  {
    default_expiry_period: {
      type: Number,
      required: true,
      default: 12,
      min: 1,
      description: "Default expiry period in months",
    },
    tier_extensions: [
      {
        _id:false,
        tier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tier" }, // Dynamic tiers
        additional_months: { type: Number, required: true, min: 0, default: 0 },
      },
    ],
    expiry_notifications: {
      first_reminder: {
        type: Number,
        required: true,
        default: 30,
      },
      second_reminder: {
        type: Number,
        required: true,
        default: 15,
      },
      final_reminder: {
        type: Number,
        required: true,
        default: 7,
      },
    },
    grace_period: {
      type: Number,
      required: true,
      default: 30,
    },
    is_active: {
      type: Boolean,
      default: true,
    },

    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// We'll only have one active expiration rule configuration at a time
points_expiration_rules_schema.statics.getActiveRules = async function () {
  return this.findOne({ is_active: true });
};

// Calculate expiry date based on user's tier
points_expiration_rules_schema.statics.calculateExpiryDate = async function ( tier_id) {
  const rules = await this.getActiveRules();
  if (!rules) return new Date(new Date().setMonth(new Date().getMonth() + 12)); // Default 12 months

  let totalMonths = rules.default_expiry_period;

  // Find if the given tier has an extension rule
  const tierExtension = rules.tier_extensions.find(
    (t) => t.tier_id.toString() === tier_id.toString()
  );
  if (tierExtension) totalMonths += tierExtension.additional_months;

  return new Date(new Date().setMonth(new Date().getMonth() + totalMonths));
};



const PointsExpirationRules = mongoose.model(
  "PointsExpirationRules",
  points_expiration_rules_schema
);

module.exports = PointsExpirationRules;
