const Customer = require("../../models/customer_model");
const Transaction = require("../../models/transaction_model");
const Tier = require("../../models/tier_model");
const PointCriteria = require("../../models/point_criteria_model");
const response_handler = require("../../helpers/response_handler");
const { logger } = require("../../middlewares/logger");
const mongoose = require("mongoose");
const AppType = require("../../models/app_type_model");
const RedemptionRules = require("../../models/redemption_rules_model");
const LoyaltyPoints = require("../../models/loyalty_points_model");
const PointsExpirationRules = require("../../models/points_expiration_rules_model");
const jwt = require("jsonwebtoken");
const { SafeTransaction } = require("../../helpers/transaction");
const CouponCode = require("../../models/merchant_offers.model");
const TierEligibilityCriteria = require("../../models/tier_eligibility_criteria_model");
const CouponBrand = require("../../models/coupon_brand_model");
const CouponCategory = require("../../models/coupon_category_model");

/**
 * FIFO Point Redemption Helper Function
 * Redeems points using First-In-First-Out logic (oldest points first)
 * @param {ObjectId} customer_id - Customer's MongoDB ObjectId
 * @param {number} pointsToRedeem - Number of points to redeem
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} { success: boolean, availablePoints: number, redeemedPoints: number }
 */
const redeemPointsFIFO = async (customer_id, pointsToRedeem, session) => {
  try {
    // Get all valid (non-expired) loyalty points sorted by expiry date (oldest first)
    const validPoints = await LoyaltyPoints.find({
      customer_id,
      expiryDate: { $gte: new Date() },
      status: 'active'
    })
      .sort({ expiryDate: 1 }) // Oldest points first (FIFO)
      .session(session);

    // Calculate total available points
    const totalAvailablePoints = validPoints.reduce((sum, entry) => sum + entry.points, 0);

    // Check if customer has enough points
    if (totalAvailablePoints < pointsToRedeem) {
      return {
        success: false,
        availablePoints: totalAvailablePoints,
        redeemedPoints: 0,
        message: `Insufficient points. Available: ${totalAvailablePoints}, Requested: ${pointsToRedeem}`
      };
    }

    // Perform FIFO redemption
    let remainingPointsToRedeem = pointsToRedeem;
    let actualRedeemedPoints = 0;

    for (const pointEntry of validPoints) {
      if (remainingPointsToRedeem <= 0) break;

      if (remainingPointsToRedeem >= pointEntry.points) {
        // Redeem entire point entry
        remainingPointsToRedeem -= pointEntry.points;
        actualRedeemedPoints += pointEntry.points;

        // Mark as redeemed instead of deleting for audit trail
        await LoyaltyPoints.findByIdAndUpdate(
          pointEntry._id,
          {
            status: 'redeemed',
            redeemedAt: new Date(),
            points: 0
          },
          { session }
        );
      } else {
        // Partially redeem point entry
        actualRedeemedPoints += remainingPointsToRedeem;
        pointEntry.points -= remainingPointsToRedeem;
        remainingPointsToRedeem = 0;

        // Update the remaining points
        await LoyaltyPoints.findByIdAndUpdate(
          pointEntry._id,
          { points: pointEntry.points },
          { session }
        );
      }
    }

    return {
      success: true,
      availablePoints: totalAvailablePoints,
      redeemedPoints: actualRedeemedPoints,
      message: `Successfully redeemed ${actualRedeemedPoints} points using FIFO`
    };

  } catch (error) {
    logger.error(`Error in FIFO point redemption: ${error.message}`, {
      customer_id,
      pointsToRedeem,
      error: error.stack
    });
    return {
      success: false,
      availablePoints: 0,
      redeemedPoints: 0,
      message: `Error during point redemption: ${error.message}`
    };
  }
};

/**
 * Check tier eligibility based on dynamic criteria from TierEligibilityCriteria model
 */
const checkTierEligibility = async (
  customer,
  targetTier,
  appType = null,
  session = null
) => {
  try {
    // Check if customer has crossed the minimum threshold

    if (customer.total_points < targetTier.points_required) {
      return {
        eligible: false,
        reason: `Insufficient points. Need ${targetTier.points_required} points, have ${customer.total_points}`,
      };
    }

    // Get dynamic criteria for this tier
    const criteria = await TierEligibilityCriteria.getCriteriaForTier(
      targetTier._id,
      appType
    );

    if (!criteria) {
      return {
        eligible: false,
        reason: `No eligibility criteria configured for tier: ${
          targetTier.name.en || targetTier.name
        }`,
      };
    }

    console.log("Dynamic criteria found:", {
      tier: targetTier.name,
      net_earning_required: criteria.net_earning_required,
      evaluation_period_days: criteria.evaluation_period_days,
      consecutive_periods_required: criteria.consecutive_periods_required,
    });

    // Use the model's validation method to check eligibility
    const eligibilityResult = await criteria.validateCustomerEligibility(
      customer._id,
      session
    );

    if (eligibilityResult.error) {
      return {
        eligible: false,
        reason: `Error validating eligibility: ${eligibilityResult.error}`,
      };
    }

    return {
      eligible: eligibilityResult.eligible,
      reason: eligibilityResult.eligible
        ? "Tier upgrade eligible based on dynamic criteria"
        : `Need ${criteria.net_earning_required} net points earned for ${criteria.consecutive_periods_required} consecutive periods of ${criteria.evaluation_period_days} days each. Currently qualified for ${eligibilityResult.details.consecutive_qualifying} periods.`,
      details: {
        ...eligibilityResult.details,
        criteria_id: criteria._id,
        tier_name: targetTier.name,
      },
    };
  } catch (error) {
    logger.error(`Error checking tier eligibility: ${error.message}`, {
      customer_id: customer.customer_id,
      target_tier: targetTier.points_required,
      error: error.stack,
    });
    return { eligible: false, reason: "Error checking tier eligibility" };
  }
};

/**
 * Evaluate and upgrade customer tier based on dynamic criteria
 */
const evaluateAndUpgradeTier = async (
  customer,
  appType = null,
  session = null
) => {
  try {
    // Get all available tiers sorted by points required

    let updatedCustomer = customer.updatedCustomer;
    const availableTiers = await Tier.find({ isActive: true })
      .sort({ points_required: 1 })
      .session(session);

    const customerTier = await Tier.findById(updatedCustomer.tier);
    let newTier = customerTier;
    let upgradeDetails = null;

    // Check each tier higher than current tier
    for (const tier of availableTiers) {
      if (tier.points_required > customerTier.points_required) {
        const eligibilityCheck = await checkTierEligibility(
          updatedCustomer,
          tier,
          appType,
          session
        );

        if (eligibilityCheck.eligible) {
          newTier = tier;
          upgradeDetails = eligibilityCheck.details;

          logger.info(
            `Tier upgrade approved for customer: ${updatedCustomer.customer_id}`,
            {
              customer_id: updatedCustomer.customer_id,
              from_tier: updatedCustomer.tier.name,
              to_tier: tier.name,
              points_required: tier.points_required,
              current_points: updatedCustomer.total_points,
              eligibility_details: eligibilityCheck.details,
            }
          );
        } else {
          logger.info(
            `Tier upgrade not eligible for customer: ${updatedCustomer.customer_id}`,
            {
              customer_id: updatedCustomer.customer_id,
              target_tier: tier.name,
              reason: eligibilityCheck.reason,
              details: eligibilityCheck.details,
            }
          );
          break; // Stop checking higher tiers if current tier is not eligible
        }
      }
    }

    return {
      upgraded: newTier._id.toString() !== updatedCustomer.tier._id.toString(),
      newTier,
      upgradeDetails,
    };
  } catch (error) {
    logger.error(`Error evaluating tier upgrade: ${error.message}`, {
      customer_id: updatedCustomer.customer_id,
      error: error.stack,
    });
    return {
      upgraded: false,
      newTier: updatedCustomer.tier,
      upgradeDetails: null,
    };
  }
};

/**
 * Register a new customer for the loyalty program
 */
const registerCustomer = async (req, res) => {
  try {
    const { name, email, mobile, customer_id, requested_by } = req.body;

    // Validate required fields
    if (!customer_id) {
      return response_handler(res, 400, "customer_id is required");
    }
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ customer_id });
    if (existingCustomer) {
      // Get tier information
      const tier = await Tier.findById(existingCustomer.tier);

      return response_handler(res, 200, "Customer already registered", {
        customer_tier: tier ? tier.name : "Bronze",
      });
    }

    // Get default tier (Bronze)
    let defaultTier = await Tier.findOne({ points_required: 0 });
    if (!defaultTier) {
      // Create default Bronze tier if it doesn't exist
      defaultTier = await Tier.create({
        name: {
          en: "Bronze",
          ar: "برونزي",
        },
        points_required: 0,
      });
    }

    // Generate unique referral code
    const referralCode = `REF${customer_id}${Date.now().toString().slice(-6)}`;
    // Find app type
    const appType = await AppType.findOne({ name: requested_by });

    if (!appType) {
      return response_handler(res, 400, "App type not found");
    }
    // Create new customer
    const newCustomer = await Customer.create({
      customer_id,
      name: name || "",
      email: email || "",
      phone: mobile || "",
      tier: defaultTier._id,
      referral_code: referralCode,
      coins: 0,
      total_points: 0,
      app_type: [appType._id],
      status: true,
    });

    logger.info(`Customer registered successfully: ${customer_id}`, {
      customer_id,
      requested_by,
    });

    return response_handler(res, 200, "Customer registered successfully", {
      customer_tier: defaultTier.name,
    });
  } catch (error) {
    logger.error(`Error registering customer: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    return response_handler(res, 500, "Internal server error");
  }
};

/**
 * View customer details and loyalty balance
 */
const viewCustomer = async (req, res) => {
  try {
    const { customer_id } = req.body;

    // Validate required fields
    if (!customer_id) {
      return response_handler(res, 400, "customer_id is required");
    }

    // Find customer with tier information
    const customer = await Customer.findOne({ customer_id }).populate("tier");

    if (!customer) {
      return response_handler(res, 404, "Customer not found");
    }

    // Find next tier logic
    let nextTier = null;
    let pointsNeeded = 0;
    
    // Get all tiers sorted by points_required to find the maximum tier
    const allTiers = await Tier.find({ isActive: true }).sort({ points_required: 1 });
    
    if (allTiers.length > 0) {
      const maxTier = allTiers[allTiers.length - 1]; // Highest tier (highest points_required)
      
      // Check if customer is already at maximum tier
      if (customer.tier._id.toString() === maxTier._id.toString()) {
        nextTier = null; // Customer is at maximum tier
      } else {
        // Find the next tier (tier with higher points_required than current)
        nextTier = allTiers.find(tier => tier.points_required > customer.tier.points_required);
        
        if (nextTier) {
          // Calculate points needed for next tier
          pointsNeeded = Math.max(0, nextTier.points_required - customer.total_points);
        }
      }
    }

    const responseData = {
      name: customer.name || "",
      email: customer.email || "",
      mobile: customer.phone || "",
      point_balance: customer.total_points || 0,
      customer_tier: customer.tier ? customer.tier.name : "Bronze",
      next_tier: nextTier
        ? {
          required_point: pointsNeeded.toString(),
          en: nextTier.name.en || nextTier.name,
          ar: nextTier.name.ar || nextTier.name,
        }: null
        // : {
        //   required_point: 0,
        //   en: "Congratulations! You are a Gold Member",
        //   ar: "تهانينا! أنت عضو ذهبي",
        // },
    };

    logger.info(`Customer details retrieved: ${customer_id}`);

    return response_handler(
      res,
      200,
      "Point balance retrieved successfully",
      responseData
    );
  } catch (error) {
    logger.error(`Error retrieving customer: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    return response_handler(res, 500, "Internal server error");
  }
};

/**
 * Add loyalty points based on transaction
 */
const addPoints = async (req, res) => {
  const transaction = new SafeTransaction();
  const session = await transaction.start();

  try {
    const {
      payment_method,
      customer_id,
      transaction_value,
      metadata,
      transaction_id,
      requested_by,
    } = req.body;

    // Validate required fields
    if (!customer_id || !transaction_value || !transaction_id) {
      await transaction.abort();
      return response_handler(
        res,
        400,
        "customer_id, transaction_value, and transaction_id are required"
      );
    }
    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({
      transaction_id: transaction_id,
    }).session(session);

    if (existingTransaction) {
      await transaction.abort();
      return response_handler(res, 400, "Transaction already processed");
    }

    // Find customer
    const customer = await Customer.findOne({ customer_id })
      .populate("tier")
      .session(session);
    if (!customer) {
      await transaction.abort();
      return response_handler(res, 404, "Customer not found");
    }

    //Findoutif all criteria code is present or abort
    //show which one is missing

    const criteriaCodes = metadata.items.map((item) => item.criteria_code);
    const allCriteriaCodes = await PointCriteria.find({
      unique_code: { $in: criteriaCodes },
    });

    const missingCriteriaCodes = criteriaCodes.filter(
      (code) => !allCriteriaCodes.some((c) => c.unique_code === code)
    );

    if (missingCriteriaCodes.length > 0) {
      await transaction.abort();
      return response_handler(
        res,
        400,
        `Missing criteria codes: ${missingCriteriaCodes.join(", ")}`
      );
    }

    // Check if all criteria have the required payment method
    const criteriaMissingPaymentMethod = [];
    for (const criteria of allCriteriaCodes) {
      const hasPaymentMethod = criteria.pointSystem.some(
        (ps) => ps.paymentMethod === payment_method
      );
      if (!hasPaymentMethod) {
        criteriaMissingPaymentMethod.push({
          criteria_code: criteria.unique_code,
          available_payment_methods: criteria.pointSystem.map(
            (ps) => ps.paymentMethod
          ),
        });
      }
    }

    if (criteriaMissingPaymentMethod.length > 0) {
      await transaction.abort();
      const missingDetails = criteriaMissingPaymentMethod
        .map(
          (item) =>
            `${item.criteria_code
            } (available: ${item.available_payment_methods.join(", ")})`
        )
        .join("; ");
      return response_handler(
        res,
        400,
        `Payment method '${payment_method}' not supported for criteria: ${missingDetails}`
      );
    }

    // Calculate points based on criteria and items
    let totalPointsAwarded = 0;
    const transactionDetails = [];
    const skippedCriteria = []; // Track criteria skipped due to limits

    if (metadata && metadata.items && Array.isArray(metadata.items)) {
      try {
        // Calculate points for each item based on criteria
        for (const item of metadata.items) {
          const { criteria_code, price } = item;

          // Find point criteria
          const criteria = await PointCriteria.findOne({
            unique_code: criteria_code,
            isActive: true,
          }).session(session);

          if (criteria) {
            // Check transaction limits
            const limitsCheck = await criteria.checkCriteriaUsageFromMetadata(
              customer._id
            );

            if (!limitsCheck.withinLimits) {
              // Skip this criteria but continue with others
              skippedCriteria.push({
                criteria_code,
                reason: limitsCheck.message,
                current_count: limitsCheck.currentCount,
                limit: limitsCheck.limit,
              });
              logger.info(
                `Skipping criteria ${criteria_code} due to limit: ${limitsCheck.message}`
              );
              continue; // Skip to next criteria
            }
            // Calculate points based on point system
            const pointSystemEntry = criteria.pointSystem.find(
              (ps) => ps.paymentMethod === payment_method
            );
            if (!pointSystemEntry) {
              logger.info(
                `No point system entry found for criteria: ${criteria_code} and payment method: ${payment_method}`
              );
              continue; // Skip if payment method not supported for this criteria
            }

            //calculate points
            //check transaction value limit
            //check minimum value irrespective of point type

            const { minValue, maxValue } =
              criteria.conditions.transactionValueLimits;
            // Skip if price is below minimum (0 or null means no minimum limit)
            if (minValue != null && minValue > 0 && price < minValue) {
              console.log("minValue not met", minValue, price);
              continue;
            }

            //now calculate points based on point type
            let itemPoints = 0;
            if (pointSystemEntry.pointType === "percentage") {
              // Cap price at maxValue if valid and exceeded (0 or null means no maximum limit)
              if (
                maxValue != null &&
                maxValue > 0 &&
                maxValue !== "undefined" &&
                !isNaN(maxValue) &&
                price > maxValue
              ) {
                price = maxValue;
              }
              //?multiplying with 1000 as per kedmah request
              itemPoints = (price * pointSystemEntry.pointRate * 1000) / 100;
              console.log("itemPoints", itemPoints);
            } else {
              //flat points
              itemPoints = price * pointSystemEntry.pointRate;
            }

            // Ensure points is a valid number
            if (isNaN(itemPoints) || !isFinite(itemPoints)) {
              itemPoints = 0;
            }

            totalPointsAwarded += itemPoints;
            transactionDetails.push({
              criteria_code,
              price,
              points_awarded: itemPoints,
              calculation_type: pointSystemEntry.pointType,
              point_rate: pointSystemEntry.pointRate,
            });
          }
        }
      } catch (error) {
        await transaction.abort();
        logger.error(`Error processing items: ${error.message}`, {
          stack: error.stack,
          body: req.body,
        });
        return response_handler(res, 500, "Error processing items");
      }
    }

    // Apply tier multiplier
    const tierMultiplier = customer.tier.tier_point_multiplier.find(
      async (tm) => {
        //find name from object id from appType
        let appType = await AppType.findById(tm.appType);
        if (appType.name === requested_by) {
          return tm.multiplier;
        }
      }
    );
    totalPointsAwarded =
      Math.ceil(totalPointsAwarded * (tierMultiplier.multiplier || 1)) || 0;

    // Ensure we have valid points before creating transaction
    if (
      isNaN(totalPointsAwarded) ||
      !isFinite(totalPointsAwarded) ||
      totalPointsAwarded < 0
    ) {
      totalPointsAwarded = 0;
    }

    // Prepare response message and transaction creation based on points awarded
    let responseMessage = "Loyalty points processed successfully";
    let shouldCreateTransaction = totalPointsAwarded > 0;

    // If no points awarded but items were processed, check if all were skipped due to limits
    if (
      totalPointsAwarded === 0 &&
      transactionDetails.length === 0 &&
      skippedCriteria.length > 0
    ) {
      responseMessage = "All criteria have reached their usage limits";
      shouldCreateTransaction = true; // Don't create transaction for 0 points
    } else if (totalPointsAwarded === 0) {
      responseMessage =
        "No points awarded due to criteria conditions not met or not enough price or points(less than 1)";
      shouldCreateTransaction = true;
    }

    let newTransaction = null;
    let updatedCustomer = customer;

    // Create transaction record only if points were awarded
    if (shouldCreateTransaction) {
      newTransaction = await Transaction.create(
        [
          {
            customer_id: customer._id,
            transaction_id: transaction_id,
            transaction_type: "earn",
            points: totalPointsAwarded,
            payment_method: payment_method,
            status: "completed",
            note: `Points earned via Khedmah SDK - ${requested_by || "Khedmah SDK"
              }`,
            metadata: {
              items: transactionDetails,
              skipped_criteria: skippedCriteria, // Include skipped criteria info
              requested_by: requested_by || "Khedmah SDK",
              original_amount: transaction_value,
              tier_multiplier: tierMultiplier || 1,
            },
            transaction_date: new Date(),
          },
        ],
        { session }
      );

      // Update customer points only if transaction was created successfully
      if (!newTransaction) {
        await transaction.abort();
        return response_handler(
          res,
          500,
          "Failed to create transaction record"
        );
      }

      // Update customer points
      updatedCustomer = await Customer.findByIdAndUpdate(
        customer._id,
        {
          $inc: {
            total_points: totalPointsAwarded,
            coins: totalPointsAwarded,
          },
        },
        { new: true, session }
      );

      if (!updatedCustomer) {
        await transaction.abort();
        return response_handler(res, 500, "Failed to update customer points");
      }

      // Create loyalty points record with expiry date
      if (totalPointsAwarded > 0) {
        try {
          // Calculate expiry date based on customer's tier
          const expiryDate = await PointsExpirationRules.calculateExpiryDate(
            customer.tier._id
          );

          // Create loyalty points record for tracking expiration
          await LoyaltyPoints.create(
            [
              {
                customer_id: customer._id,
                points: totalPointsAwarded,
                expiryDate: expiryDate,
                transaction_id: newTransaction[0]._id,
                earnedAt: new Date(),
                status: "active",
              },
            ],
            { session }
          );

          logger.info(
            `Loyalty points record created with expiry: ${customer_id}`,
            {
              customer_id,
              points: totalPointsAwarded,
              expiryDate: expiryDate,
              transaction_id: newTransaction[0]._id,
            }
          );
        } catch (expiryError) {
          logger.error(
            `Error creating loyalty points record: ${expiryError.message}`,
            {
              customer_id,
              points: totalPointsAwarded,
              error: expiryError.stack,
            }
          );
          // Don't abort transaction for expiry record creation failure
          // The main transaction should still succeed
        }
      }

      // Check for tier upgrade
      const availableTiers = await Tier.find({})
        .sort({ points_required: 1 })
        .session(session);
      let newTier = customer.tier;

      for (const tier of availableTiers) {
        if (updatedCustomer.total_points >= tier.points_required) {
          newTier = tier;
        }
      }
      // Update tier if changed
      if (newTier._id.toString() !== customer.tier._id.toString()) {
        await Customer.findByIdAndUpdate(
          customer._id,
          { tier: newTier._id },
          { session }
        );

        logger.info(`Customer tier upgraded: ${customer_id}`, {
          customer_id,
          from_tier: customer.tier.name,
          to_tier: newTier.name,
          upgrade_details: `Points-based upgrade: ${updatedCustomer.total_points} points`
        });
      }
    }

    await transaction.commit();

    // Prepare response data
    const responseData = {
      points_awarded: totalPointsAwarded,
      point_balance: updatedCustomer.total_points,
    };

    // Add additional info if there were skipped criteria
    if (skippedCriteria.length > 0) {
      responseData.skipped_criteria = skippedCriteria;
      responseData.note = `${skippedCriteria.length} criteria skipped due to usage limits`;
    }

    logger.info(`Points processed: ${customer_id}`, {
      customer_id,
      transaction_id,
      points_awarded: totalPointsAwarded,
      transaction_value,
      requested_by,
      skipped_criteria_count: skippedCriteria.length,
      response_message: responseMessage,
    });

    return response_handler(res, 200, responseMessage, responseData);
  } catch (error) {
    await transaction.abort();
    logger.error(`Error adding points: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    logger.error(`Error adding points: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    return response_handler(res, 500, "Internal server error");
  } finally {
    await transaction.end();
  }
};

/**
 * Redeem loyalty points for purchase
 */
const redeemPoints = async (req, res) => {
  const transaction = new SafeTransaction();
  const session = await transaction.start();

  try {
    const { customer_id, total_spent, requested_by, transaction_id } = req.body;

    // Validate required fields
    if (!customer_id || !total_spent || !transaction_id) {
      await transaction.abort();
      return response_handler(
        res,
        400,
        "customer_id, total_spent, and transaction_id are required"
      );
    }

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({
      transaction_id: transaction_id,
    }).session(session);

    if (existingTransaction) {
      await transaction.abort();
      return response_handler(res, 400, "Transaction already processed");
    }

    // Find customer
    const customer = await Customer.findOne({ customer_id }).session(session);
    if (!customer) {
      await transaction.abort();
      return response_handler(res, 404, "Customer not found");
    }
    // Calculate points to redeem (assuming 1 point = 1 currency unit)
    const pointsToRedeem = total_spent;

    // Get active redemption rules
    const appType = await AppType.findOne({ name: requested_by }).session(
      session
    );
    if (!appType) {
      await transaction.abort();
      return response_handler(res, 404, "App type requested by not found");
    }
    const redemptionRules = await RedemptionRules.findOne({
      is_active: true,
      appType: appType._id,
    }).session(session);

    if (!redemptionRules) {
      logger.info(`No redemption rules found for ${requested_by}`);
    }
    if (redemptionRules) {
      // Check minimum points requirement
      if (pointsToRedeem < redemptionRules.minimum_points_required) {
        await transaction.abort();
        return response_handler(
          res,
          400,
          `Minimum points required for redemption is ${redemptionRules.minimum_points_required}`
        );
      }

      // Check daily points limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysRedemptions = await Transaction.aggregate([
        {
          $match: {
            customer_id: customer._id,
            transaction_type: "redeem",
            transaction_date: { $gte: today },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: "$points" },
          },
        },
      ]).session(session);

      const pointsRedeemedToday = Math.abs(
        todaysRedemptions[0]?.totalPoints || 0
      );

      if (
        pointsRedeemedToday + pointsToRedeem >
        redemptionRules.maximum_points_per_day
      ) {
        await transaction.abort();
        return response_handler(
          res,
          400,
          `Daily redemption limit of ${redemptionRules.maximum_points_per_day} points would be exceeded`
        );
      }
      // Apply tier multiplier if exists
    }

    // Use FIFO redemption logic
    const fifoResult = await redeemPointsFIFO(customer._id, pointsToRedeem, session);

    if (!fifoResult.success) {
      await transaction.abort();
      return response_handler(res, 400, fifoResult.message);
    }

    // Update customer total points (subtract the actually redeemed points)
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customer._id,
      {
        $inc: {
          total_points: -fifoResult.redeemedPoints,
        },
      },
      { new: true, session }
    );

    await transaction.commit();

    logger.info(`Points redeemed successfully: ${customer_id}`, {
      customer_id,
      transaction_id,
      points_redeemed: pointsToRedeem,
      total_spent,
      requested_by,
    });

    return response_handler(res, 200, "Points redeemed successfully", {
      total_spent,
      point_balance: updatedCustomer.total_points,
    });
  } catch (error) {
    await transaction.abort();
    logger.error(`Error redeeming points: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    return response_handler(res, 500, "Internal server error");
  } finally {
    await transaction.end();
  }
};

/**
 * Cancel a previous point redemption
 */
const cancelRedemption = async (req, res) => {
  const transaction = new SafeTransaction();
  const session = await transaction.start();

  try {
    const { customer_id, transaction_id } = req.body;

    // Validate required fields
    if (!customer_id || !transaction_id) {
      await transaction.abort();
      return response_handler(
        res,
        400,
        "customer_id and transaction_id are required"
      );
    }

    // Find the original redemption transaction
    const originalTransaction = await Transaction.findOne({
      transaction_id: transaction_id,
      transaction_type: "redeem",
    })
      .populate("customer_id")
      .session(session);

    if (!originalTransaction) {
      await transaction.abort();
      return response_handler(res, 404, "Redemption transaction not found");
    }

    // Verify customer matches
    if (originalTransaction.customer_id.customer_id !== customer_id) {
      await transaction.abort();
      return response_handler(
        res,
        400,
        "Customer ID does not match transaction"
      );
    }

    // Check if already cancelled
    const existingCancellation = await Transaction.findOne({
      transaction_id: `${transaction_id}_cancelled`,
      transaction_type: "adjust",
    }).session(session);

    if (existingCancellation) {
      await transaction.abort();
      return response_handler(res, 400, "Transaction already cancelled");
    }

    // Calculate points to restore (reverse the negative points)
    const pointsToRestore = Math.abs(originalTransaction.points);

    // Create cancellation transaction
    await Transaction.create(
      [
        {
          customer_id: originalTransaction.customer_id._id,
          transaction_id: `${transaction_id}_cancelled`,
          transaction_type: "adjust",
          points: pointsToRestore,
          status: "completed",
          note: `Cancellation of redemption - Original transaction: ${transaction_id}`,
          metadata: {
            original_transaction_id: transaction_id,
            requested_by: "Khedmah SDK",
          },
          transaction_date: new Date(),
        },
      ],
      { session }
    );

    // Update customer points
    const updatedCustomer = await Customer.findByIdAndUpdate(
      originalTransaction.customer_id._id,
      {
        $inc: {
          total_points: pointsToRestore,
        },
      },
      { new: true, session }
    );

    // Create loyalty points record with expiry date for restored points
    if (pointsToRestore > 0) {
      try {
        // Get customer with tier information for expiry calculation
        const customerWithTier = await Customer.findById(
          originalTransaction.customer_id._id
        )
          .populate("tier")
          .session(session);

        // Calculate expiry date based on customer's tier
        const expiryDate = await PointsExpirationRules.calculateExpiryDate(
          customerWithTier.tier._id
        );

        // Create loyalty points record for tracking expiration of restored points
        await LoyaltyPoints.create(
          [
            {
              customer_id: originalTransaction.customer_id._id,
              points: pointsToRestore,
              expiryDate: expiryDate,
              transaction_id: (
                await Transaction.findOne({
                  transaction_id: `${transaction_id}_cancelled`,
                  transaction_type: "adjust",
                }).session(session)
              )._id,
              earnedAt: new Date(),
              status: "active",
            },
          ],
          { session }
        );

        logger.info(
          `Loyalty points record created for cancelled redemption: ${customer_id}`,
          {
            customer_id,
            points: pointsToRestore,
            expiryDate: expiryDate,
            original_transaction_id: transaction_id,
          }
        );
      } catch (expiryError) {
        logger.error(
          `Error creating loyalty points record for cancellation: ${expiryError.message}`,
          {
            customer_id,
            points: pointsToRestore,
            error: expiryError.stack,
          }
        );
        // Don't abort transaction for expiry record creation failure
      }
    }

    await transaction.commit();

    logger.info(`Redemption cancelled successfully: ${customer_id}`, {
      customer_id,
      transaction_id,
      points_restored: pointsToRestore,
    });

    return response_handler(res, 200, "Points processed successfully", {
      points_added: pointsToRestore,
      point_balance: updatedCustomer.total_points,
    });
  } catch (error) {
    await transaction.abort();
    logger.error(`Error cancelling redemption: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    return response_handler(res, 500, "Internal server error");
  } finally {
    await transaction.end();
  }
};

const generateToken = async (req, res) => {
  try {
    const { customer_id, requested_by } = req.body;
    const appType = await AppType.findOne({ name: requested_by });
    if (!appType) {
      return response_handler(res, 404, "App type not found");
    }
    const customer = await Customer.findOne({ customer_id }).select(
      "customer_id name email phone"
    );

    if (!customer) {
      return response_handler(res, 404, "Customer not found");
    }

    const token = jwt.sign({ customer_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const responseData = {
      token,
      customer_id: customer.customer_id,
    };
    return response_handler(
      res,
      200,
      "Token generated successfully",
      responseData
    );
  } catch (error) {
    logger.error(`Error generating token: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    console.log(error);
    return response_handler(res, 500, "Internal server error");
  }
};

/**
 * Get customer transaction history
 */
const getTransactionHistory = async (req, res) => {
  try {
    const { customer_id, page = 1, limit = 20 } = req.body;

    // Validate required fields
    if (!customer_id) {
      return response_handler(res, 400, "customer_id is required");
    }

    // Find customer
    const customer = await Customer.findOne({ customer_id }).populate("tier");
    if (!customer) {
      return response_handler(res, 404, "Customer not found");
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get transactions with pagination
    const transactions = await Transaction.find({ customer_id: customer._id })
      .sort({ transaction_date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments({
      customer_id: customer._id,
    });

    // Format transactions for frontend
    const formattedTransactions = transactions.map((transaction) => {
      const isEarned =
        transaction.transaction_type === "earn" ||
        (transaction.transaction_type === "adjust" && transaction.points > 0);

      return {
        id: transaction._id,
        type: isEarned ? "earned" : "burned",
        title: isEarned ? "Points Earned" : "Points Redeemed",
        description: transaction.note || "Transaction",
        points: Math.abs(transaction.points),
        date: new Date(transaction.transaction_date).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        transaction_id: transaction.transaction_id,
        status: transaction.status,
      };
    });

    const responseData = {
      customer: {
        name: customer.name || "",
        email: customer.email || "",
        mobile: customer.phone || "",
        point_balance: customer.total_points || 0,
        customer_tier: customer.tier ? customer.tier.name : "Bronze",
      },
      transactions: formattedTransactions,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        per_page: parseInt(limit),
        has_next: page * limit < totalCount,
        has_prev: page > 1,
      },
    };

    logger.info(`Transaction history retrieved: ${customer_id}`, {
      customer_id,
      page,
      limit,
      total_transactions: totalCount,
    });

    return response_handler(
      res,
      200,
      "Transaction history retrieved successfully",
      responseData
    );
  } catch (error) {
    logger.error(`Error retrieving transaction history: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    return response_handler(res, 500, "Internal server error");
  }
};

const getMerchantOffers = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, categoryId } = req.query;
    const filter = {};
    if (type) {
      filter.type = type;
    }
    if (categoryId) filter.couponCategoryId = categoryId;
    const coupons = await CouponCode.find(filter)
      .populate("merchantId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    //replace a string  like api-uat-loyalty.xyvin.com in image url with 141.105.172.45:7733/api
    coupons.forEach((coupon) => {
      coupon.posterImage = coupon.posterImage.replace(
        "http://api-uat-loyalty.xyvin.com/",
        "http://141.105.172.45:7733/api/"
      );
    });
   coupons.forEach((coupon) => {
     coupon.merchantId.image = coupon.merchantId.image.replace(
       "http://api-uat-loyalty.xyvin.com/",
       "http://141.105.172.45:7733/api/"
     )
   })
    const total = await CouponCode.countDocuments();

    return response_handler(
      res,
      200,
      "All coupons retrieved successfully",
      coupons,
      total
    );
  } catch (error) {
    console.error("Error retrieving all coupons:", error);
    return response_handler(res, 500, false, "Error retrieving all coupons");
  }
};

const getCouponBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipCount = (page - 1) * limit;

    const filter = {};

    const couponBrands = await CouponBrand.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();
    couponBrands.forEach((brand) => {
      brand.image = brand.image.replace(
        "http://api-uat-loyalty.xyvin.com/",
        "http://141.105.172.45:7733/api/"
      );
    });
    const total_count = await CouponBrand.countDocuments();
    return response_handler(
      res,
      200,
      "Coupon brands retrieved successfully",
      couponBrands,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, "Error retrieving coupon brands", error);
  }
};
const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipCount = (page - 1) * limit;

    const filter = {};
    const couponCategories = await CouponCategory.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();
    couponCategories.forEach((category) => {
      category.image = category.image.replace(
        "http://api-uat-loyalty.xyvin.com/",
        "http://141.105.172.45:7733/api/"
      );
    });
    const total_count = await CouponCategory.countDocuments();
    return response_handler(
      res,
      200,
      "Coupon categories retrieved successfully",
      couponCategories,
      total_count
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      "Error retrieving coupon categories",
      error
    );
  }
};

const getCouponDetails = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await CouponCode.findById(couponId).populate("merchantId");
    coupon.posterImage = coupon.posterImage.replace(
      "http://api-uat-loyalty.xyvin.com/",
      "http://141.105.172.45:7733/api/"
    );
    if (coupon?.merchantId?.image) {
      coupon.merchantId.image = coupon.merchantId.image.replace(
        "http://api-uat-loyalty.xyvin.com/",
        "http://141.105.172.45:7733/api/"
      );
    }
    return response_handler(
      res,
      200,
      "Coupon details retrieved successfully",
      coupon
    );
  } catch (error) {
    console.error("Error retrieving coupon details:", error);
    return response_handler(res, 500, false, "Error retrieving coupon details");
  }
};

const redeemCoupon = async (req, res) => {
  try {
    const { couponId, customer_id, pin } = req.body;
    const coupon = await CouponCode.findById(couponId);
    if (!coupon) {
      return response_handler(res, 404, "Coupon not found");
    }
    if (coupon.pin && coupon.pin !== pin) {
      return response_handler(res, 400, "Invalid pin");
    }
    if (coupon.isActive === false) {
      return response_handler(res, 400, "Coupon is not active");
    }
    if (coupon.isExpired === true) {
      return response_handler(res, 400, "Coupon has expired");
    }
    if (coupon.isRedeemed === true) {
      return response_handler(res, 400, "Coupon has already been redeemed");
    }

  } catch (error) {
    console.error("Error redeeming coupon:", error);
    return response_handler(res, 500, false, "Error redeeming coupon");
  }
};

/**
 * Evaluate existing customer for tier upgrade (Admin function)
 */
const evaluateCustomerTier = async (req, res) => {
  try {
    const { customer_id } = req.body;

    if (!customer_id) {
      return response_handler(res, 400, "customer_id is required");
    }

    // Find customer with tier information
    const customer = await Customer.findOne({ customer_id }).populate("tier");
    if (!customer) {
      return response_handler(res, 404, "Customer not found");
    }

    // Evaluate tier eligibility
    const tierEvaluation = await evaluateAndUpgradeTier(customer);

    const responseData = {
      customer_id: customer.customer_id,
      current_tier: customer.tier.name,
      current_points: customer.total_points,
      tier_evaluation: {
        eligible_for_upgrade: tierEvaluation.upgraded,
        recommended_tier: tierEvaluation.newTier.name,
        upgrade_details: tierEvaluation.upgradeDetails,
      },
    };

    // If eligible and upgrade requested, perform the upgrade
    if (req.body.perform_upgrade && tierEvaluation.upgraded) {
      await Customer.findByIdAndUpdate(customer._id, {
        tier: tierEvaluation.newTier._id,
      });

      responseData.upgrade_performed = true;
      responseData.new_tier = tierEvaluation.newTier.name;

      logger.info(`Admin tier upgrade performed: ${customer_id}`, {
        customer_id,
        from_tier: customer.tier.name,
        to_tier: tierEvaluation.newTier.name,
        admin_action: true,
      });
    }

    return response_handler(
      res,
      200,
      "Tier evaluation completed",
      responseData
    );
  } catch (error) {
    logger.error(`Error evaluating customer tier: ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
    return response_handler(res, 500, "Internal server error");
  }
};

module.exports = {
  registerCustomer,
  viewCustomer,
  addPoints,
  redeemPoints,
  cancelRedemption,
  generateToken,
  getTransactionHistory,
  getMerchantOffers,
  getCouponDetails,
  redeemCoupon,
  getCouponBrands,
  getAllCategories,
  evaluateCustomerTier,
};
