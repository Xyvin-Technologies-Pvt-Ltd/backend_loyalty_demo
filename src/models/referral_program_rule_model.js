const mongoose = require("mongoose"); 

const referralProgramRuleSchema = new mongoose.Schema({
  pointsForReferrer: { type: Number, required: true },
  pointsForReferee: { type: Number, required: true },
  minimumPurchaseAmount: { type: Number, required: true },
  expiryDays: { type: Number, required: true },
  maxReferralsPerUser: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
},{timestamps: true});

// Ensure only one active referral program exists
referralProgramRuleSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany({ isActive: true }, { isActive: false });
  }
  next();
});

module.exports = mongoose.model("ReferralProgramRule", referralProgramRuleSchema);
