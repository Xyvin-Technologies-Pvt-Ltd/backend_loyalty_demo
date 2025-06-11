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

    const responseData = {
      name: customer.name || "",
      email: customer.email || "",
      mobile: customer.phone || "",
      point_balance: customer.total_points || 0,
      customer_tier: customer.tier ? customer.tier.name : "Bronze",
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
            `${
              item.criteria_code
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

              itemPoints = (price * pointSystemEntry.pointRate) / 100;
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
      Math.floor(totalPointsAwarded * (tierMultiplier.multiplier || 1)) || 0;

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
      shouldCreateTransaction = false; // Don't create transaction for 0 points
    } else if (totalPointsAwarded === 0) {
      responseMessage =
        "No points awarded due to criteria conditions not met or not enough price or points(less than 1)";
      shouldCreateTransaction = false;
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
            note: `Points earned via Khedmah SDK - ${
              requested_by || "Khedmah SDK"
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
        .sort({ minimum_points: 1 })
        .session(session);
      let newTier = customer.tier;

      for (const tier of availableTiers) {
        if (updatedCustomer.total_points >= tier.minimum_points) {
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
      return response_handler(res, 404, "App type/ requested by not found");
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

    // Check if customer has enough points
    if (customer.total_points < pointsToRedeem) {
      await transaction.abort();
      return response_handler(res, 400, "Insufficient points balance");
    }

    // Create redemption transaction
    await Transaction.create(
      [
        {
          customer_id: customer._id,
          transaction_id: transaction_id,
          transaction_type: "redeem",
          points: -pointsToRedeem,
          status: "completed",
          note: `Points redeemed via Khedmah SDK - ${
            requested_by || "Khedmah SDK"
          }`,
          metadata: {
            requested_by: requested_by || "Khedmah SDK",
            total_spent: total_spent,
          },
          transaction_date: new Date(),
        },
      ],
      { session }
    );

    // Update customer points
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customer._id,
      {
        $inc: {
          total_points: -pointsToRedeem,
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
    console.log(customer_id);
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

module.exports = {
  registerCustomer,
  viewCustomer,
  addPoints,
  redeemPoints,
  cancelRedemption,
  generateToken,
};
