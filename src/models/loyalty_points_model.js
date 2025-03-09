

const mongoose = require("mongoose");

const loyalty_points_schema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  points: { type: Number, required: true },
  expiryDate: { type: Date, required: true }, // Expiry date for each point transaction
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  earnedAt: { type: Date, default: Date.now }
},{
    timestamps: true
});

const LoyaltyPoints = mongoose.model("LoyaltyPoints", loyalty_points_schema);

module.exports = LoyaltyPoints;
