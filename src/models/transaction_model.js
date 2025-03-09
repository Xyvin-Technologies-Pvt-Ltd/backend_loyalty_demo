const mongoose = require("mongoose");

const transaction_schema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    transaction_type: {
      type: String,
      trim: true,
      enum: ["earn", "redeem", "expire", "adjust", "transfer"],
      required: true,
    },

    source: {
      type: String,
      enum: [
        "purchase",
        "referral",
        "registration",
        "social_share",
        "review",
        "login",
        "bill_payment",
        "recharge",
        "birthday",
        "manual_adjustment",
        "redemption",
        "expiration",
        "tier_upgrade",
        "special_event",
        "other",
      ],
      default: "other",
    },

    points: {
      type: Number,
      required: true,
      // Positive for earn, negative for redeem/expire
    },

    transaction_id: {
      type: String,
      unique: true,
      required: true,
    },

    // References to related models
    trigger_event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TriggerEvent",
      default: null,
    },

    trigger_service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TriggerServices",
      default: null,
    },

    point_criteria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PointsCriteria",
      default: null,
    },

    app_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppType",
    },

    status: {
      type: String,
      trim: true,
      enum: [
        "pending",
        "completed",
        "rejected",
        "cancelled",
        "failed",
        "expired",
      ],
      default: "pending",
    },

    note: {
      type: String,
      trim: true,
    },

    reference_id: {
      type: String,
      // ID of the original transaction or action that triggered this
      trim: true,
    },

    transaction_date: {
      type: Date,
      default: Date.now,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Flexible field for additional context-specific data
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
transaction_schema.index({ customer_id: 1, transaction_date: -1 });
transaction_schema.index({ customer_id: 1, transaction_type: 1 });
transaction_schema.index({ transaction_id: 1 }, { unique: true });
transaction_schema.index({ reference_id: 1 });
transaction_schema.index({ trigger_event: 1 });
transaction_schema.index({ point_criteria: 1 });

const Transaction = mongoose.model("Transaction", transaction_schema);

module.exports = Transaction;
