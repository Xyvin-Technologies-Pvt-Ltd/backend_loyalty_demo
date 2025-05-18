const { v4: uuidv4 } = require("uuid");
const LoyaltyPoints = require("../../models/loyalty_points_model");
const response_handler = require("../../helpers/response_handler");
const Customer = require("../../models/customer_model");
const mongoose = require("mongoose");
const PointsExpirationRules = require("../../models/points_expiration_rules_model");
const Criteria = require("../../models/point_criteria_model");
const Transaction = require("../../models/transaction_model");

//redeem loyalty points
// This function is used to redeem loyalty points from the user's account
// that is the user has earned points and wants to redeem them for a certain reward. 
// This process happens when after he chooses a reward from merchant offer of Kidmah offer and is valid then redeem the points

exports.redeem_loyalty_points = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer_id, pointsToRedeem, metadata, app_type } = req.body;

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
    }, { new: true });

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
// By processing loyalty event, we mean that the user has earned loyalty points based on a certain event, service, app type, tier, condition etc  
// This is the main function that will be used to process the loyalty event
exports.process_loyalty_event = async (req, res) => {
  try {
    const {
      criteria_code,
      paymentMethod,
      customerId,
      transactionValue,
      metadata,
      reference_id,
      app_type
    } = req.body;

    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return response_handler(res, 400, "Customer not found");
    }

    // Find the point criteria using our static method
    const pointCriteria = await Criteria.findMatchingCriteria(
      criteria_code    );

    if (!pointCriteria) {
      return response_handler(
        res,
        404,
        "No point criteria found for this event"
      );
    }

    // Use our new optimized method to check eligibility - no need to fetch transactions first!
    const eligibilityCheck = await pointCriteria.checkEligibilityOptimized(
      paymentMethod,
      transactionValue,
      customerId
    );

    if (!eligibilityCheck.eligible) {
      return response_handler(
        res,
        400,
        eligibilityCheck.message,
        { details: eligibilityCheck.details }
      );
    }

    // Calculate points using our new method
    const pointsToAward = eligibilityCheck.points;

    // Fetch expiry rules & calculate expiry date
    const expiryDate = await PointsExpirationRules.calculateExpiryDate(
      customer.tier
    );

    // Create a transaction
    const transaction = await Transaction.create({
      customer_id: customerId,
      transaction_type: "earn",
      points: pointsToAward,
      transaction_id: uuidv4(),
      point_criteria: pointCriteria._id,
      payment_method: paymentMethod,
      status: "pending",
      metadata: metadata,
      app_type: app_type,
      reference_id: reference_id,
    });

    // Add the points to the customer's loyalty points
    await LoyaltyPoints.create({
      customer_id: customerId,
      points: pointsToAward,
      expiryDate: expiryDate,
      transaction_id: transaction._id,
    });

    // Update customer's total points
    await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: { total_points: pointsToAward },
      },
      { new: true }
    );

    // Update the transaction status
    await Transaction.findByIdAndUpdate(transaction._id, {
      status: "success",
    });

    return response_handler(
      res,
      200,
      "Loyalty points processed successfully",
      {
        pointsAwarded: pointsToAward,
        calculationDetails: eligibilityCheck.details
      }
    );
  } catch (error) {
    console.error("Process loyalty event error:", error);
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
    }, { new: true });

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
