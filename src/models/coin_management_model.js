const mongoose = require("mongoose");

const coinConversionSchema = new mongoose.Schema(
  {
    pointsPerCoin: {
      type: Number,
      required: true,
    },
    minimumPoints: {
      type: Number,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// We'll only have one active coin conversion rule configuration at a time
coinConversionSchema.statics.getActiveRules = async function () {
  return this.findOne({ is_active: true });
};  

module.exports = mongoose.model("CoinConversionRule", coinConversionSchema);
