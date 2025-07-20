const { logger } = require("../middlewares/logger");
const Customer = require("../models/customer_model");
const LoyaltyPoints = require("../models/loyalty_points_model");
const Transaction = require("../models/transaction_model");
const Tier = require("../models/tier_model");
const { SafeTransaction } = require("../helpers/transaction");

// Tier downgrade configuration
const TIER_DOWNGRADE_RULES = {
  SILVER: {
    minPoints: 300,
    minMonthlyAverage: 100, // Must earn average of 100 points per month
    gracePeriodMonths: 3,
  },
  GOLD: {
    minPoints: 450,
    minMonthlyAverage: 150, // Must earn average of 150 points per month
    gracePeriodMonths: 3,
  },
};

/**
 * Process expired points and handle tier downgrades
 * Runs at midnight on the first day of each month
 */
async function processPointsAndTiers() {
  const transaction = new SafeTransaction();

  try {
    await transaction.startTransaction();
    const session = transaction.session;

    logger.info(
      "Starting monthly points expiration and tier downgrade process"
    );

    // 1. Find all expired points (status: active and expiryDate < now)
    const now = new Date();
    const expiredPoints = await LoyaltyPoints.find({
      status: "active",
      expiryDate: { $lt: now },
    }).session(session);

    logger.info(`Found ${expiredPoints.length} expired point records`);

    // Process each expired points record
    for (const pointRecord of expiredPoints) {
      try {
        // Mark points as expired
        await LoyaltyPoints.findByIdAndUpdate(
          pointRecord._id,
          { status: "expired" },
          { session }
        );

        // Create expiration transaction
        await Transaction.create(
          [
            {
              customer_id: pointRecord.customer_id,
              transaction_type: "expire",
              points: -pointRecord.points,
              transaction_id: `EXP-${Date.now()}-${pointRecord.customer_id}`,
              status: "completed",
              note: `Points expired on ${now.toISOString()}`,
              reference_id: pointRecord.transaction_id,
              transaction_date: now,
            },
          ],
          { session }
        );

        // Update customer's total points
        await Customer.findByIdAndUpdate(
          pointRecord.customer_id,
          { $inc: { total_points: -pointRecord.points } },
          { session }
        );

        logger.info(
          `Processed expiration for customer ${pointRecord.customer_id}: ${pointRecord.points} points`
        );
      } catch (error) {
        logger.error(
          `Error processing expired points for record ${pointRecord._id}:`,
          error
        );
        // Continue with next record
        continue;
      }
    }

    // 2. Process tier downgrades with grace period
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Get all tiers
    const tiers = await Tier.find({}).session(session);
    const silverTier = tiers.find(
      (t) => t.name?.en === "Silver" || t.name === "Silver"
    );
    const goldTier = tiers.find(
      (t) => t.name?.en === "Gold" || t.name === "Gold"
    );
    const bronzeTier = tiers.find((t) => t.points_required === 0); // Lowest tier

    if (!silverTier || !goldTier || !bronzeTier) {
      throw new Error("Required tiers not found");
    }

    // Find customers in Silver and Gold tiers
    const customers = await Customer.find({
      tier: { $in: [silverTier._id, goldTier._id] },
    })
      .populate("tier")
      .session(session);

    logger.info(
      `Processing tier downgrades for ${customers.length} customers in Silver/Gold tiers`
    );

    for (const customer of customers) {
      try {
        // Get monthly points earned in last 3 months
        const monthlyPoints = await Transaction.aggregate([
          {
            $match: {
              customer_id: customer._id,
              transaction_type: "earn",
              transaction_date: { $gte: threeMonthsAgo },
              status: "completed",
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$transaction_date" },
                month: { $month: "$transaction_date" },
              },
              monthlyTotal: { $sum: "$points" },
            },
          },
        ]).session(session);

        // Calculate average monthly points
        const totalMonths = monthlyPoints.length || 1; // Avoid division by zero
        const totalPointsEarned = monthlyPoints.reduce(
          (sum, month) => sum + month.monthlyTotal,
          0
        );
        const monthlyAverage = totalPointsEarned / totalMonths;

        // Check if downgrade is needed based on tier
        const currentTier = customer.tier.name?.en || customer.tier.name;
        const rules = TIER_DOWNGRADE_RULES[currentTier.toUpperCase()];

        if (rules && customer.total_points < rules.minPoints) {
          // Check if monthly average is below the required threshold
          if (monthlyAverage < rules.minMonthlyAverage) {
            const newTier = currentTier === "Gold" ? silverTier : bronzeTier;

            await Customer.findByIdAndUpdate(
              customer._id,
              { tier: newTier._id },
              { session }
            );

            logger.info(
              `Downgraded customer ${customer._id} from ${currentTier} to ${
                newTier.name?.en || newTier.name
              }. ` +
                `Total points: ${customer.total_points}, ` +
                `Monthly average points: ${monthlyAverage.toFixed(
                  2
                )} (Required: ${rules.minMonthlyAverage})`
            );
          } else {
            logger.info(
              `Customer ${customer._id} retained ${currentTier} tier despite low points (${customer.total_points}) ` +
                `due to sufficient monthly average (${monthlyAverage.toFixed(
                  2
                )} points/month)`
            );
          }
        }
      } catch (error) {
        logger.error(
          `Error processing tier downgrade for customer ${customer._id}:`,
          error
        );
        // Continue with next customer
        continue;
      }
    }

    await transaction.commit();
    logger.info(
      "Successfully completed monthly points expiration and tier downgrade process"
    );
  } catch (error) {
    await transaction.abort();
    logger.error(
      "Error in monthly points expiration and tier downgrade process:",
      error
    );
  } finally {
    await transaction.end();
  }
}

module.exports = {
  processPointsAndTiers,
};
