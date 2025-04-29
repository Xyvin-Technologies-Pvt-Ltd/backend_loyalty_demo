const mongoose = require("mongoose");

const tier_schema = new mongoose.Schema(
  {
    name: {
      en: { type: String, trim: true },
      ar: { type: String, trim: true },
    },
    points_required: { type: Number, default: 0, trim: true },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      en: [{ type: String, trim: true }],
      ar: [{ type: String, trim: true }],
    },
  },
  { timestamps: true }
);

const Tier = mongoose.model("Tier", tier_schema);

module.exports = Tier;
