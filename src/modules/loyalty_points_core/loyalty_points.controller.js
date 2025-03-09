const LoyaltyPoints = require("../../models/loyalty_points_model");
const loyalty_points_validator = require("./loyalty_points.validator");
const response_handler = require("../../helpers/response_handler");
const Customer = require("../../models/customer_model");
const mongoose = require("mongoose");
const PointsExpirationRules = require("../../models/points_expiration_rules_model");    




exports.earn_loyalty_points = async (req, res) => {
  try {
    const { error } = loyalty_points_validator.validate(req.body);
    if (error) return response_handler(res, 400, error.details[0].message);

    const { customer_id, points,transaction_id } = req.body;

    //find tier of customer
    const customer = await Customer.findById(customer_id);
    const tier = customer.tier;

    /// Fetch expiry rules & calculate expiry date
    const expiryDate = await PointsExpirationRules.calculateExpiryDate(tier);

    const newPoints = new LoyaltyPoints({
        customer_id,
        points,
        expiryDate,
        transaction_id,  // Store transaction reference
      });

      await newPoints.save();

    return response_handler(
      res,
      200,
      "Loyalty points added successfully",
      newPoints
    );
  } catch (error) {
    return response_handler(res, 500, error.message);
  }
};


//redeem loyalty points
exports.redeem_loyalty_points = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { error } = loyalty_points_validator.validate(req.body);
      if (error) {
        await session.abortTransaction();
        session.endSession();
        return response_handler(res, 400, error.details[0].message);
      }
  
      const { customer_id, pointsToRedeem } = req.body;
  
      // Step 1: Calculate Total Valid Points
      const totalPoints = await LoyaltyPoints.aggregate([
        { $match: { customer_id, expiryDate: { $gte: new Date() } } },
        { $group: { _id: null, total: { $sum: "$points" } } }
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
      }).sort({ expiryDate: 1 }) // ✅ Oldest points first
        .session(session);
  
      if (!validPoints.length) {
        await session.abortTransaction(); // ✅ Ensure rollback before return
        session.endSession();
        return response_handler(res, 400, "No valid points available for redemption");
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
  
      return response_handler(res, 200, "Points redeemed successfully!");
  
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Redemption failed:", error);
      return response_handler(res, 500, "Redemption failed, please try again.");
    }
  };
  
