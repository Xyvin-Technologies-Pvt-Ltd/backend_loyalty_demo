const mongoose = require("mongoose");

const user_schema = new mongoose.Schema(
  {
    customer_id: { type: String, trim: true },
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    points: { type: Number, default: 0, trim: true },
    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
    },
    referral_code: {
      type: String,
      unique: true,
    },
    referred_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user_referer_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    app: {
      type: [String],
      trim: true,
      enum: ["Khedmah-Mobile", "Khedmah-Merchant"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", user_schema);

module.exports = User;
