const { v4: uuidv4 } = require("uuid");
const LoyaltyPoints = require("../../models/loyalty_points_model");
const response_handler = require("../../helpers/response_handler");
const Customer = require("../../models/customer_model");
const mongoose = require("mongoose");
const PointsExpirationRules = require("../../models/points_expiration_rules_model");
const Criteria = require("../../models/point_criteria_model");
const Transaction = require("../../models/transaction_model");

//redeem loyalty points
exports.redeem_loyalty_points = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer_id, pointsToRedeem, metadata,app_type } = req.body;

    //create a transaction
    const transaction = await Transaction.create({
      customer_id: customer_id,
      transaction_type: "redeem",
      points: pointsToRedeem,
      transaction_id: uuidv4(),
      status: "pending",
      metadata: metadata,
      app_type: app_type,
    });

    // Step 1: Calculate Total Valid Points
    const totalPoints = await LoyaltyPoints.aggregate([
      { $match: { customer_id, expiryDate: { $gte: new Date() } } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]).session(session);

    const availablePoints = totalPoints.length > 0 ? totalPoints[0].total : 0;

    // Step 2: Check if the user has enough points
    if (availablePoints < pointsToRedeem) {
      await session.abortTransaction();
      session.endSession();
      return response_handler(res, 400, "Insufficient points");
    }

    // Step 3: Deduct points using FIFO (oldest points first)
    let remainingPoints = pointsToRedeem;

    const validPoints = await LoyaltyPoints.find({
      customer_id,
      expiryDate: { $gte: new Date() },
    })
      .sort({ expiryDate: 1 }) // ✅ Oldest points first
      .session(session);

    if (!validPoints.length) {
      await session.abortTransaction(); // ✅ Ensure rollback before return
      session.endSession();
      return response_handler(
        res,
        400,
        "No valid points available for redemption"
      );
    }

    for (const entry of validPoints) {
      if (remainingPoints <= 0) break;

      if (remainingPoints >= entry.points) {
        remainingPoints -= entry.points;
        await LoyaltyPoints.findByIdAndDelete(entry._id).session(session); // ✅ Use session
      } else {
        entry.points -= remainingPoints;
        await entry.save({ session });
        remainingPoints = 0;
      }
    }

    // Step 4: Commit Transaction
    await session.commitTransaction();
    session.endSession();


    //update the customer total points
    await Customer.findByIdAndUpdate(customer_id, {
      $inc: { total_points: -pointsToRedeem },
    },{new:true});

    //update the transaction
    await Transaction.findByIdAndUpdate(transaction._id, {
      status: "success",
    });

    return response_handler(res, 200, "Points redeemed successfully!");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Redemption failed:", error);
    return response_handler(res, 500, "Redemption failed, please try again.");
  }
};
//process a loyalty point earning event from user based on trigger event, trigger service, app type , user tier, condition etc
exports.process_loyalty_event = async (req, res) => {
  try {
    const {
      eventType,
      serviceType,
      appType,
      paymentMethod,
      customerId,
      transactionValue,
      metadata,
    } = req.body;

    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return response_handler(res, 400, "Customer not found");
    }

    // Find the point criteria
    const pointCriteria = await Criteria.findOne({
      eventType,
      serviceType,
      appType,
    });

    if (!pointCriteria) {
      return response_handler(
        res,
        404,
        "No point criteria found for this event"
      );
    }
    //check if the point criteria is active
    if (!pointCriteria.isActive) {
      return response_handler(res, 400, "Point criteria is not active");
    }

    // Find which point system to use based on payment method
    const pointSystem_paymentMethod = pointCriteria.pointSystem.find(
      (point) => point.paymentMethod === paymentMethod
    );
    if (!pointSystem_paymentMethod) {
      return response_handler(
        res,
        400,
        "No point system found for this payment method"
      );
    }

    //check if the customer meets the condition based on his previous transaction

    // Define start dates for weekly and monthly checks
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - 7);
    const startOfMonth = new Date(currentDate);
    startOfMonth.setDate(1);

    //check his previous transaction
    const pastTransactions = await Transaction.findOne({
      customerId,
      point_criteria: pointCriteria._id,
      createdAt: { $gte: startOfMonth },
    });

    // Count weekly and monthly transactions
    const weeklyCount = pastTransactions.filter(
      (tx) => tx.createdAt >= startOfWeek
    ).length;
    const monthlyCount = pastTransactions.length;
    // Get transaction limits from point criteria
    const maxWeekly = pointCriteria.conditions.maxTransactions.weekly;
    const maxMonthly = pointCriteria.conditions.maxTransactions.monthly;

    // Check if user exceeded limits
    if (weeklyCount != null && weeklyCount >= maxWeekly) {
      return response_handler(res, 400, "Weekly transaction limit exceeded");
    }
    if (monthlyCount != null && monthlyCount >= maxMonthly) {
      return response_handler(res, 400, "Monthly transaction limit exceeded");
    }

    // Check if the transaction value is within the allowed limits
    const minTransactionLimit =
      pointSystem.conditions.transactionValueLimits.find(
        (limit) => transactionValue >= limit.minValue
      );

    if (!minTransactionLimit) {
      return response_handler(
        res,
        400,
        "Transaction value does not meet the minimum required limits"
      );
    }
    //calculate points
    let pointsOfEvent;
    const pointType = pointSystem_paymentMethod[0].pointType;
    const pointRate = pointSystem_paymentMethod[0].pointRate;
    //check max value for percentage
    if (pointType === "percentage") {
      const maxTransactionLimit =
        pointCriteria.conditions.transactionValueLimits.maxValue;
      let applicableValue = transactionValue;

      // If transaction value exceeds max limit, apply maxValue's percentage
      if (transactionValue > maxTransactionLimit) {
        applicableValue = maxTransactionLimit;
      }

      // Calculate percentage points and round
      let calculatedPoints = Math.round((applicableValue * pointRate) / 100);
      pointsOfEvent = calculatedPoints;
    } else {
      pointsOfEvent = pointRate;
    }

    //find tier of customer
    //check if the customer has a tier
    if (!customer.tier) {
      return response_handler(res, 400, "Customer has no tier");
    }

    /// Fetch expiry rules & calculate expiry date
    const expiryDate = await PointsExpirationRules.calculateExpiryDate(
      customer.tier
    );

    //Create a transaction first
    const transaction = await Transaction.create({
      customer_id: customerId,
      transaction_type: "earn",
      points: pointsOfEvent,
      transaction_id: uuidv4(),
      point_criteria: pointCriteria._id,
      payment_method: paymentMethod,
      status: "pending",
      metadata: metadata,
      app_type: appType,
      reference_id: reference_id,
    });

    // Add the points to the customer's loyalty points
    await LoyaltyPoints.create({
      customer_id: customerId,
      points: pointsOfEvent,
      expiryDate: expiryDate,
      transaction_id: transaction._id,
    });

    await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: { total_points: pointsOfEvent },
      },
      { new: true }
    );

    //update the transaction
    await Transaction.findByIdAndUpdate(transaction._id, {
      status: "success",
    });

    return response_handler(res, 200, "Loyalty points processed successfully");
  } catch (error) {
    return response_handler(res, 500, error.message);
  }
};

//adjust point by admin
exports.adjust_point_by_admin = async (req, res) => {
  try {
    const { customer_id, points, metadata } = req.body;
    const transaction = await Transaction.create({
      customer_id: customer_id,
      transaction_type: "adjust",
      points: points,
      transaction_id: uuidv4(),
      status: "pending",
      metadata: metadata,
    });

    const loyalty_points = await LoyaltyPoints.create({
      customer_id: customer_id,
      transaction_id: transaction._id,
      points: points,
    });

    await Customer.findByIdAndUpdate(customer_id, {
      $inc: { total_points: points },
    },{new:true});

    await Transaction.findByIdAndUpdate(transaction._id, {
      status: "success",
    });

    return response_handler(res, 200, "Loyalty points adjusted successfully", {
      loyalty_points: loyalty_points,
      transaction: transaction,
    });
  } catch (error) {
    return response_handler(res, 500, error.message);
  }
};
