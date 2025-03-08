const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // Prevents multiple referrals of the same user
    status: { type: String, enum: ["pending", "completed", "expired"], default: "pending" },
    referralPoints: {
      referrerPoints: { type: Number, default: 0 },
      refereePoints: { type: Number, default: 0 },
    },
    firstLoginDate: { type: Date, default: null },
    firstPurchaseDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  });
  
  // Auto-expire referrals after expiryDays
  referralSchema.methods.checkExpiry = async function () {
    const program = await mongoose.model("ReferralProgram").findOne({ isActive: true });
    const expiryDate = new Date(this.createdAt);
    expiryDate.setDate(expiryDate.getDate() + program.expiryDays);
    
    if (new Date() > expiryDate) {
      this.status = "expired";
      await this.save();
    }
  };
  
  module.exports = mongoose.model("ReferralEntry", referralSchema);
  