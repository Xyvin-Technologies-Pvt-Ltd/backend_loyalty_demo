const mongoose = require("mongoose");

// Points Criteria Schema
const pointsCriteriaSchema = new mongoose.Schema(
  {
    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TriggerEvent",
      required: true,
    },

    serviceType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TriggerServices",
      required: true,
    },

    appType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppType",
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    //point-earning-system , not discount system

    pointSystem: [
      {
        paymentMethod: {
          type: String,
          enum: ["Khedmah-site", "KhedmahPay-Wallet"], // Separate logic for Khedmah & KhedmahPay
          required: true,
        },
        pointType: {
          type: String,
          enum: ["percentage", "fixed"],
          required: true,
        },
        pointRate: { type: Number, required: true },
      },
    ],

    conditions: {
      maxTransactions: {
        weekly: { type: Number, default: null },
        monthly: { type: Number, default: null },
      },
      transactionValueLimits: 
        {
          minValue: { type: Number, default: 0 },
          maxValue: { type: Number, default: null },
        },
      
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PointsCriteria = mongoose.model("PointsCriteria", pointsCriteriaSchema);

module.exports = PointsCriteria;
