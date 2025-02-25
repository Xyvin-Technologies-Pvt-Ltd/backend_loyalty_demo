const mongoose = require("mongoose");

const transaction_schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: { type: Number, trim: true },
    points: { type: Number, trim: true },
    type: { type: String, trim: true },
    merchant: { type: String, trim: true },
    status: {
      type: String,
      trim: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transaction_schema);

module.exports = Transaction;
