const { logger } = require("../middlewares/logger");
const Customer = require("../models/customer_model");
const LoyaltyPoints = require("../models/loyalty_points_model");
const Transaction = require("../models/transaction_model");
const Tier = require("../models/tier_model");
const TierEligibilityCriteria = require("../models/tier_eligibility_criteria_model");
const AppType = require("../models/app_type_model");
const { SafeTransaction } = require("../helpers/transaction");

/**
 * Check if customer meets tier eligibility criteria for tier retention
 * @param {Object} customer - Customer object
 * @param {Object} tier - Tier object
 * @param {Object} session - Database session
 * @returns {boolean} - Whether customer meets criteria
 */
const checkTierRetentionEligibility = async (customer, tier, session) => {
  try {
    // Get tier eligibility criteria for this tier
    const criteria = await TierEligibilityCriteria.findOne({
      tier_id: tier._id,
      is_active: true
    }).session(session);

    if (!criteria) {
      logger.warn(`No tier eligibility criteria found for tier ${tier.name?.en || tier.name}`);
      // If no criteria defined, use basic point threshold only
      return customer.total_points >= tier.points_required;
    }

    // Check if customer has minimum points required for the tier
    if (customer.total_points < tier.points_required) {
      logger.info(`Customer ${customer._id} below tier points threshold, checking consecutive periods`, {
        tier: tier.name?.en || tier.name,
        totalPoints: customer.total_points,
        tierRequired: tier.points_required,
        consecutivePeriodsRequired: criteria.consecutive_periods_required,
        evaluationPeriodDays: criteria.evaluation_period_days,
        netEarningRequired: criteria.net_earning_required
      });

      // Check consecutive evaluation periods
      const now = new Date();
      let consecutivePeriodsWithSufficientEarnings = 0;

      // Check each consecutive period starting from the most recent
      for (let periodIndex = 0; periodIndex < criteria.consecutive_periods_required; periodIndex++) {
        // Calculate period start and end dates
        const periodEndDate = new Date(now);
        periodEndDate.setDate(periodEndDate.getDate() - (periodIndex * criteria.evaluation_period_days));

        const periodStartDate = new Date(periodEndDate);
        periodStartDate.setDate(periodStartDate.getDate() - criteria.evaluation_period_days);

        // Get transactions within this specific period
        const periodTransactions = await Transaction.find({
          customer_id: customer._id,
          transaction_type: "earn",
          transaction_date: {
            $gte: periodStartDate,
            $lt: periodEndDate
          },
          status: "completed"
        }).session(session);

        // Calculate net earnings in this period
        const periodNetEarnings = periodTransactions.reduce((sum, transaction) => sum + transaction.points, 0);

        logger.debug(`Period ${periodIndex + 1} check for customer ${customer._id}:`, {
          periodStart: periodStartDate.toISOString(),
          periodEnd: periodEndDate.toISOString(),
          periodNetEarnings,
          requiredEarnings: criteria.net_earning_required,
          meetsRequirement: periodNetEarnings >= criteria.net_earning_required
        });

        // Check if this period meets the earning requirement
        if (periodNetEarnings >= criteria.net_earning_required) {
          consecutivePeriodsWithSufficientEarnings++;
        } else {
          // Break the consecutive chain - customer fails retention
          logger.info(`Customer ${customer._id} failed tier retention - insufficient earnings in period ${periodIndex + 1}`, {
            tier: tier.name?.en || tier.name,
            periodNetEarnings,
            requiredEarnings: criteria.net_earning_required,
            consecutivePeriodsAchieved: consecutivePeriodsWithSufficientEarnings,
            consecutivePeriodsRequired: criteria.consecutive_periods_required
          });
          return false;
        }
      }

      // Check if customer met all consecutive periods requirement
      const meetsConsecutiveRequirement = consecutivePeriodsWithSufficientEarnings >= criteria.consecutive_periods_required;

      logger.info(`Customer ${customer._id} tier retention result:`, {
        tier: tier.name?.en || tier.name,
        totalPoints: customer.total_points,
        tierRequired: tier.points_required,
        consecutivePeriodsAchieved: consecutivePeriodsWithSufficientEarnings,
        consecutivePeriodsRequired: criteria.consecutive_periods_required,
        meetsRetentionCriteria: meetsConsecutiveRequirement,
        verdict: meetsConsecutiveRequirement ? 'RETAIN_TIER' : 'DOWNGRADE'
      });

      return meetsConsecutiveRequirement;
    }

    // Customer has sufficient points for their tier
    logger.debug(`Customer ${customer._id} has sufficient points for tier ${tier.name?.en || tier.name} (${customer.total_points} >= ${tier.points_required})`);
    return true; // Customer retains tier
  } catch (error) {
    logger.error(`Error checking tier retention eligibility: ${error.message}`, {
      customer_id: customer._id,
      tier_id: tier._id,
      error: error.stack
    });
    return true; // Default to retention in case of error
  }
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

    // 2. Process tier downgrades using dynamic eligibility criteria
    // Get all tiers ordered by points_required (highest to lowest)
    const tiers = await Tier.find({})
      .sort({ points_required: -1 })
      .session(session);

    const bronzeTier = tiers.find((t) => t.points_required === 0) || tiers[tiers.length - 1]; // Lowest tier

    if (!bronzeTier) {
      throw new Error("Bronze/Base tier not found");
    }

    // Find customers in tiers above bronze (excluding bronze tier)
    const customersToCheck = await Customer.find({
      tier: { $ne: bronzeTier._id }
    })
      .populate("tier")
      .session(session);

    logger.info(
      `Processing tier downgrades for ${customersToCheck.length} customers in elevated tiers`
    );

    for (const customer of customersToCheck) {
      try {
        const currentTier = customer.tier;

        // Check if customer meets retention criteria for current tier
        const meetsRetentionCriteria = await checkTierRetentionEligibility(customer, currentTier, session);

        if (!meetsRetentionCriteria) {
          // Find the appropriate tier to downgrade to
          let newTier = bronzeTier; // Default to bronze

          // Find the highest tier the customer is eligible for
          for (const tier of tiers) {
            if (tier._id.toString() === currentTier._id.toString()) continue; // Skip current tier
            if (tier.points_required <= customer.total_points) {
              const meetsNewTierCriteria = await checkTierRetentionEligibility(customer, tier, session);
              if (meetsNewTierCriteria) {
                newTier = tier;
                break; // Take the first (highest) tier they qualify for
              }
            }
          }

          // Only downgrade if the new tier is actually lower
          if (newTier.points_required < currentTier.points_required) {
            await Customer.findByIdAndUpdate(
              customer._id,
              { tier: newTier._id },
              { session }
            );

            // Log the downgrade with details
            logger.info(
              `Downgraded customer ${customer._id} from ${currentTier.name?.en || currentTier.name} to ${newTier.name?.en || newTier.name}`, {
              customerId: customer._id,
              fromTier: currentTier.name?.en || currentTier.name,
              toTier: newTier.name?.en || newTier.name,
              totalPoints: customer.total_points,
              reason: "Failed to meet tier retention criteria"
            }
            );

            // Create audit transaction for tier change
            await Transaction.create(
              [
                {
                  customer_id: customer._id,
                  transaction_type: "tier_downgrade",
                  points: 0,
                  transaction_id: `TIER-DOWN-${Date.now()}-${customer._id}`,
                  status: "completed",
                  note: `Tier downgraded from ${currentTier.name?.en || currentTier.name} to ${newTier.name?.en || newTier.name} due to insufficient activity`,
                  metadata: {
                    previous_tier: currentTier.name?.en || currentTier.name,
                    new_tier: newTier.name?.en || newTier.name,
                    total_points: customer.total_points,
                    downgrade_reason: "tier_retention_criteria_not_met"
                  },
                  transaction_date: now,
                },
              ],
              { session }
            );
          } else {
            logger.info(
              `Customer ${customer._id} retains ${currentTier.name?.en || currentTier.name} tier (no lower eligible tier found)`, {
              customerId: customer._id,
              currentTier: currentTier.name?.en || currentTier.name,
              totalPoints: customer.total_points
            }
            );
          }
        } else {
          logger.debug(
            `Customer ${customer._id} retains ${currentTier.name?.en || currentTier.name} tier (meets retention criteria)`, {
            customerId: customer._id,
            tier: currentTier.name?.en || currentTier.name,
            totalPoints: customer.total_points
          }
          );
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
