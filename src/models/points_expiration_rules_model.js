const mongoose = require("mongoose");

const points_expiration_rules_schema = new mongoose.Schema(
  {
    default_expiry_period: {
      type: Number,
      required: true,
      default: 30,
      min: 15,
      description: "Default expiry period in days",
    },
    tier_extensions: [
      {
        _id:false,
        tier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tier" }, // Dynamic tiers
        additional_months: { type: Number, required: true, min: 0, default: 0 }, //it is days, not changing key for now
      },
    ],
    appType: { type: mongoose.Schema.Types.ObjectId, ref: "AppType" },

    expiry_notifications: {
      first_reminder: {
        type: Number,
        default: 30,
      },
      second_reminder: {
        type: Number,
        default: 15,
      },
      final_reminder: {
        type: Number,
        default: 7,
      },
    },
    grace_period: {
      type: Number,
      default: 0,
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
points_expiration_rules_schema.statics.calculateExpiryDate = async function (tier_id, earnedAt = new Date()) {
  const rules = await this.getActiveRules();
  if (!rules) {
    // Default to 30 days from now if no rules
    return new Date(earnedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  let totalDays = rules.default_expiry_period;

  // Check for tier-specific extension (also in days)
  const tierExtension = rules.tier_extensions.find(
    (t) => t.tier_id.toString() === tier_id.toString()
  );
  if (tierExtension) {
    totalDays += tierExtension.additional_months; // interpreted as additional days
  }

  // Add days to the earnedAt timestamp
  const expiryDate = new Date(earnedAt.getTime() + totalDays * 24 * 60 * 60 * 1000);
  return expiryDate;
};



const PointsExpirationRules = mongoose.model(
  "PointsExpirationRules",
  points_expiration_rules_schema
);

module.exports = PointsExpirationRules;
