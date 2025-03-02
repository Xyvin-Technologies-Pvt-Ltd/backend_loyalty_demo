const mongoose = require("mongoose");

const transaction_schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: { type: Number, trim: true },
    points: { type: Number, trim: true, required: true },
    type: {
      type: String,
      trim: true,
      enum: ["earning", "redemption", "referral", "other", "expiry"],
      required: true
    },
    merchant: { type: String, trim: true },
    status: {
      type: String,
      trim: true,
      enum: ["pending", "completed", "rejected", "cancelled", "failed", "expired"],
      default: "pending",
    },
    note: { type: Object, trim: true },
    provider: { type: String, trim: true },
    app: {
      type: String,
      trim: true,
      enum: ["Khedmah Delivery", "Khedmah Payment"],
    },
    // Additional fields for redemption transactions
    transaction_date: {
      type: Date,
      default: Date.now
    },
    transaction_reference: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined values to not trigger uniqueness constraint
    },
    reward_type: {
      type: String,
      trim: true
    },
    reward_details: {
      type: mongoose.Schema.Types.Mixed
    },
    // Fields for point expiration
    expiry_date: {
      type: Date,
      index: true
    },
    is_expired: {
      type: Boolean,
      default: false
    },
    points_remaining: {
      type: Number,
      default: function () {
        // For earning transactions, initially set points_remaining equal to points
        return this.type === "earning" ? this.points : 0;
      }
    },
    // For redemption transactions, track which earning transactions were used
    redeemed_from: [{
      transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
      },
      points_used: {
        type: Number
      }
    }]
  },
  { timestamps: true }
);

// Index for faster queries by user and date
transaction_schema.index({ user: 1, transaction_date: 1 });
transaction_schema.index({ user: 1, type: 1 });
transaction_schema.index({ user: 1, expiry_date: 1, is_expired: 1 });

// Static method to get total points redeemed by a user on a specific day
transaction_schema.statics.getTotalPointsRedeemedToday = async function (userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        type: "redemption",
        transaction_date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "completed"] }
      }
    },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: "$points" }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalPoints : 0;
};

// Static method to get user's point balance with expiration information
transaction_schema.statics.getUserPointBalanceWithExpiry = async function (userId) {
  // Get all active earning transactions with remaining points
  const earningTransactions = await this.find({
    user: userId,
    type: { $in: ["earning", "referral"] },
    status: "completed",
    is_expired: false,
    points_remaining: { $gt: 0 }
  }).sort({ transaction_date: 1 }); // Sort by date (oldest first for FIFO)

  // Get total active points
  const totalActivePoints = earningTransactions.reduce((sum, tx) => sum + tx.points_remaining, 0);

  // Get expiring soon points (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringSoonPoints = earningTransactions
    .filter(tx => tx.expiry_date && tx.expiry_date <= thirtyDaysFromNow)
    .reduce((sum, tx) => sum + tx.points_remaining, 0);

  // Group by expiry date for detailed breakdown
  const expiryBreakdown = earningTransactions.reduce((acc, tx) => {
    if (!tx.expiry_date) return acc;

    const expiryDateStr = tx.expiry_date.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!acc[expiryDateStr]) {
      acc[expiryDateStr] = {
        date: tx.expiry_date,
        points: 0
      };
    }
    acc[expiryDateStr].points += tx.points_remaining;
    return acc;
  }, {});

  return {
    totalActivePoints,
    expiringSoonPoints,
    expiryBreakdown: Object.values(expiryBreakdown).sort((a, b) => a.date - b.date)
  };
};

// Static method to get user's point balance (simple version)
transaction_schema.statics.getUserPointBalance = async function (userId) {
  const result = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        status: "completed",
        is_expired: { $ne: true } // Exclude expired points
      }
    },
    {
      $group: {
        _id: "$type",
        totalPoints: { $sum: "$points" }
      }
    }
  ]);

  let earned = 0;
  let redeemed = 0;

  result.forEach(item => {
    if (["earning", "referral"].includes(item._id)) {
      earned += item.totalPoints;
    } else if (item._id === "redemption") {
      redeemed += item.totalPoints;
    } else if (item._id === "expiry") {
      earned -= item.totalPoints; // Subtract expired points
    }
  });

  return earned - redeemed;
};

// Static method to find and mark expired points
transaction_schema.statics.processExpiredPoints = async function () {
  const now = new Date();

  // Find earning transactions that have expired but not yet marked as expired
  const expiredTransactions = await this.find({
    type: { $in: ["earning", "referral"] },
    status: "completed",
    is_expired: false,
    expiry_date: { $lt: now },
    points_remaining: { $gt: 0 }
  });

  let totalExpiredPoints = 0;
  const expiredByUser = {};

  // Process each expired transaction
  for (const tx of expiredTransactions) {
    const expiredPoints = tx.points_remaining;
    totalExpiredPoints += expiredPoints;

    // Mark as expired
    tx.is_expired = true;
    await tx.save();

    // Track expired points by user
    if (!expiredByUser[tx.user]) {
      expiredByUser[tx.user] = 0;
    }
    expiredByUser[tx.user] += expiredPoints;
  }

  // Create expiry transactions for each user
  for (const userId in expiredByUser) {
    if (expiredByUser[userId] > 0) {
      await this.create({
        user: userId,
        points: expiredByUser[userId],
        type: "expiry",
        status: "completed",
        transaction_date: now,
        note: { message: "Points expired" }
      });
    }
  }

  return {
    totalExpiredPoints,
    expiredTransactions: expiredTransactions.length,
    affectedUsers: Object.keys(expiredByUser).length
  };
};

// Static method to redeem points using FIFO method
transaction_schema.statics.redeemPointsFIFO = async function (userId, pointsToRedeem, redemptionTxData, session) {
  // Get available earning transactions sorted by date (oldest first)
  const availableTransactions = await this.find({
    user: userId,
    type: { $in: ["earning", "referral"] },
    status: "completed",
    is_expired: false,
    points_remaining: { $gt: 0 }
  }).sort({ transaction_date: 1 }).session(session);

  // Calculate total available points
  const totalAvailablePoints = availableTransactions.reduce((sum, tx) => sum + tx.points_remaining, 0);

  // Check if user has enough points
  if (totalAvailablePoints < pointsToRedeem) {
    throw new Error(`Insufficient points. Available: ${totalAvailablePoints}, Requested: ${pointsToRedeem}`);
  }

  // Create redemption transaction
  const redemptionTx = new this({
    ...redemptionTxData,
    points: pointsToRedeem,
    redeemed_from: []
  });

  // Apply FIFO redemption logic
  let remainingToRedeem = pointsToRedeem;

  for (const tx of availableTransactions) {
    if (remainingToRedeem <= 0) break;

    const pointsToUseFromTx = Math.min(tx.points_remaining, remainingToRedeem);

    // Update the earning transaction
    tx.points_remaining -= pointsToUseFromTx;
    await tx.save({ session });

    // Track which transactions were used for this redemption
    redemptionTx.redeemed_from.push({
      transaction_id: tx._id,
      points_used: pointsToUseFromTx
    });

    remainingToRedeem -= pointsToUseFromTx;
  }

  // Save the redemption transaction
  await redemptionTx.save({ session });

  return redemptionTx;
};

const Transaction = mongoose.model("Transaction", transaction_schema);

module.exports = Transaction;
