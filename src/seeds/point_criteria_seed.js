const mongoose = require("mongoose");
const PointsCriteria = require("../models/point_criteria_model");
const TriggerEvent = require("../models/trigger_event_model");
const TriggerServices = require("../models/trigger_services_model");
const AppType = require("../models/app_type_model");
const { logger } = require("../middlewares/logger");

/**
 * Seed points criteria
 */
const seedPointsCriteria = async () => {
  try {
    // Check if points criteria already exist
    const existingPointsCriteria = await PointsCriteria.countDocuments();
    if (existingPointsCriteria > 0) {
      logger.info(
        "Points criteria already seeded. Skipping points criteria seed."
      );
      return;
    }

    // Get references to required models
    const purchaseEvent = await TriggerEvent.findOne({ name: "Purchase" });
    const rechargeEvent = await TriggerEvent.findOne({ name: "Recharge" });
    const billPaymentEvent = await TriggerEvent.findOne({
      name: "Bill Payment",
    });

    const retailPurchaseService = await TriggerServices.findOne({
      title: "Retail Purchase",
    });
    const mobileRechargeService = await TriggerServices.findOne({
      title: "Mobile Recharge",
    });
    const electricityBillService = await TriggerServices.findOne({
      title: "Electricity Bill",
    });

    const mobileApp = await AppType.findOne({ name: "Mobile App" });
    const webPortal = await AppType.findOne({ name: "Web Portal" });

    // If any required references are missing, log warning and exit
    if (
      !purchaseEvent ||
      !rechargeEvent ||
      !billPaymentEvent ||
      !retailPurchaseService ||
      !mobileRechargeService ||
      !electricityBillService ||
      !mobileApp ||
      !webPortal
    ) {
      logger.warn(
        "Required references not found. Please seed trigger events, services, and app types first."
      );
      return;
    }

    const pointsCriteria = [
      {
        category: purchaseEvent._id,
        serviceName: retailPurchaseService._id,
        app: mobileApp._id,
        pointSystem: [
          {
            type: "Khedmah",
            pointType: "percentage",
            pointRate: 2,
            conditions: {
              minTransactionValue: 10,
              maxTransactions: {
                weekly: 10,
                monthly: 40,
              },
              transactionValueLimits: [
                {
                  minValue: 10,
                  maxValue: 100,
                  pointRate: 2,
                },
                {
                  minValue: 100.01,
                  maxValue: 500,
                  pointRate: 3,
                },
                {
                  minValue: 500.01,
                  maxValue: null,
                  pointRate: 5,
                },
              ],
            },
          },
          {
            type: "KhedmahPay",
            pointType: "percentage",
            pointRate: 3,
            conditions: {
              minTransactionValue: 5,
              maxTransactions: {
                weekly: 15,
                monthly: 60,
              },
              transactionValueLimits: [
                {
                  minValue: 5,
                  maxValue: 100,
                  pointRate: 3,
                },
                {
                  minValue: 100.01,
                  maxValue: null,
                  pointRate: 5,
                },
              ],
            },
          },
        ],
        isActive: true,
      },
      {
        category: rechargeEvent._id,
        serviceName: mobileRechargeService._id,
        app: mobileApp._id,
        pointSystem: [
          {
            type: "Khedmah",
            pointType: "fixed",
            pointRate: 10,
            conditions: {
              minTransactionValue: 5,
              maxTransactions: {
                weekly: 5,
                monthly: 20,
              },
              transactionValueLimits: [
                {
                  minValue: 5,
                  maxValue: 20,
                  pointRate: 10,
                },
                {
                  minValue: 20.01,
                  maxValue: null,
                  pointRate: 20,
                },
              ],
            },
          },
        ],
        isActive: true,
      },
      {
        category: billPaymentEvent._id,
        serviceName: electricityBillService._id,
        app: webPortal._id,
        pointSystem: [
          {
            type: "KhedmahPay",
            pointType: "percentage",
            pointRate: 1,
            conditions: {
              minTransactionValue: 20,
              maxTransactions: {
                weekly: 2,
                monthly: 5,
              },
              transactionValueLimits: [
                {
                  minValue: 20,
                  maxValue: 200,
                  pointRate: 1,
                },
                {
                  minValue: 200.01,
                  maxValue: null,
                  pointRate: 1.5,
                },
              ],
            },
          },
        ],
        isActive: true,
      },
    ];

    // Save all points criteria
    await PointsCriteria.insertMany(pointsCriteria);

    logger.info("Points criteria seeded successfully!");
  } catch (error) {
    logger.error(`Error seeding points criteria: ${error.message}`);
  }
};

module.exports = seedPointsCriteria;
