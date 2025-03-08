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
    tierBonuses: {
      silver: {
        type: Number,
        default: 0,
      },
      gold: {
        type: Number,
        default: 0,
      },
      platinum: {
        type: Number,
        default: 0,
      },
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

module.exports = mongoose.model("CoinConversionRule", coinConversionSchema);
