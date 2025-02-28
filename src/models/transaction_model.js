const mongoose = require("mongoose");

const transaction_schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: { type: Number, trim: true },
    points: { type: Number, trim: true },
    type: {
      type: String,
      trim: true,
      enum: ["earning", "redemption", "referral", "other"],
    },
    merchant: { type: String, trim: true },
    status: {
      type: String,
      trim: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    note: { type: Object, trim: true },
    provider: { type: String, trim: true },
    app: {
      type: String,
      trim: true,
      enum: ["Khedmah Delivery", "Khedmah Payment"],
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transaction_schema);

module.exports = Transaction;
