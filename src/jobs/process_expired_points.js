const LoyaltyPoints = require('../models/loyalty_points_model');
const Customer = require('../models/customer_model');
const { logger } = require('../middlewares/logger');
const Transaction = require('../models/transaction_model');

/**
 * Process expired points job
 * This job should be scheduled to run daily
 */
async function processExpiredPoints() {
    console.log("Running loyalty points expiry job...");

    try {
      // Find expired points that are still active
      const expiredPoints = await LoyaltyPoints.find({ expiryDate: { $lte: new Date() }, status: "active" });
  
      if (expiredPoints.length === 0) {
        console.log("No expired points found.");
        return;
      }
  
      // Process each expired transaction
      for (const point of expiredPoints) {
        await Customer.findByIdAndUpdate(
          point.customer_id,
          { $inc: { total_loyalty_points: -point.points } }, // Deduct expired points
          { new: true }
        );
  
        // Mark points as expired
        await LoyaltyPoints.findByIdAndUpdate(point._id, { status: "expired" });
        await Transaction.create({
          customer_id: point.customer_id,
          points: point.points,
          transaction_type: "expire",
          transaction_id: point._id,
          reference_id: point.transaction_id,
          note: "point expired",
          status: "expired",
        });
      }
  
      console.log(`Expired ${expiredPoints.length} loyalty point transactions.`);
    } catch (error) {
      console.error("Error in loyalty points expiry job:", error);
    }
}

module.exports = processExpiredPoints; 