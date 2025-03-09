const mongoose = require("mongoose");
const Transaction = require("../models/transaction_model");
const TriggerEvent = require("../models/trigger_event_model");
const TriggerServices = require("../models/trigger_services_model");
const PointsCriteria = require("../models/point_criteria_model");
const AppType = require("../models/app_type_model");
const { logger } = require("../middlewares/logger");
const { v4: uuidv4 } = require("uuid");

/**
 * Seed transactions
 */
const seedTransactions = async () => {
  try {
    // Check if transactions already exist
    const existingTransactions = await Transaction.countDocuments();
    if (existingTransactions > 0) {
      logger.info("Transactions already seeded. Skipping transaction seed.");
      return;
    }

    // Get references to required models
    const purchaseEvent = await TriggerEvent.findOne({ name: "Purchase" });
    const rechargeEvent = await TriggerEvent.findOne({ name: "Recharge" });

    const retailPurchaseService = await TriggerServices.findOne({
      title: "Retail Purchase",
    });
    const mobileRechargeService = await TriggerServices.findOne({
      title: "Mobile Recharge",
    });

    const pointCriteria = await PointsCriteria.findOne();

    const mobileApp = await AppType.findOne({ name: "Mobile App" });

    // Mock customer IDs (in a real scenario, these would be actual customer IDs)
    const customerIds = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
    ];

    // Create sample transactions
    const transactions = [
      // Earn transactions
      {
        customer_id: customerIds[0],
        transaction_type: "earn",
        source: "purchase",
        points: 100,
        transaction_id: uuidv4(),
        trigger_event: purchaseEvent ? purchaseEvent._id : null,
        trigger_service: retailPurchaseService
          ? retailPurchaseService._id
          : null,
        point_criteria: pointCriteria ? pointCriteria._id : null,
        app_type: mobileApp ? mobileApp._id : null,
        status: "completed",
        note: "Points earned from retail purchase",
        reference_id: "POS12345",
        transaction_date: new Date(),
        metadata: {
          purchase_amount: 500,
          store_id: "STORE001",
        },
      },
      {
        customer_id: customerIds[1],
        transaction_type: "earn",
        source: "recharge",
        points: 50,
        transaction_id: uuidv4(),
        trigger_event: rechargeEvent ? rechargeEvent._id : null,
        trigger_service: mobileRechargeService
          ? mobileRechargeService._id
          : null,
        point_criteria: pointCriteria ? pointCriteria._id : null,
        app_type: mobileApp ? mobileApp._id : null,
        status: "completed",
        note: "Points earned from mobile recharge",
        reference_id: "RECH78901",
        transaction_date: new Date(),
        metadata: {
          recharge_amount: 200,
          provider: "Telecom Provider",
        },
      },
      // Redeem transaction
      {
        customer_id: customerIds[0],
        transaction_type: "redeem",
        source: "redemption",
        points: -75,
        transaction_id: uuidv4(),
        app_type: mobileApp ? mobileApp._id : null,
        status: "completed",
        note: "Points redeemed for discount",
        reference_id: "RED45678",
        transaction_date: new Date(),
        metadata: {
          redemption_type: "discount",
          discount_amount: 15,
        },
      },
      // Expire transaction
      {
        customer_id: customerIds[2],
        transaction_type: "expire",
        source: "expiration",
        points: -25,
        transaction_id: uuidv4(),
        app_type: mobileApp ? mobileApp._id : null,
        status: "completed",
        note: "Points expired due to inactivity",
        transaction_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        metadata: {
          expiry_reason: "inactivity",
          original_earn_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        },
      },
      // Adjust transaction
      {
        customer_id: customerIds[1],
        transaction_type: "adjust",
        source: "manual_adjustment",
        points: 30,
        transaction_id: uuidv4(),
        app_type: mobileApp ? mobileApp._id : null,
        status: "completed",
        note: "Manual adjustment by admin",
        reference_id: "ADJ12345",
        transaction_date: new Date(),
        metadata: {
          adjusted_by: "admin@example.com",
          reason: "Customer service compensation",
        },
      },
    ];

    // Save all transactions
    await Transaction.insertMany(transactions);

    logger.info("Transactions seeded successfully!");
  } catch (error) {
    logger.error(`Error seeding transactions: ${error.message}`);
  }
};

module.exports = seedTransactions;
