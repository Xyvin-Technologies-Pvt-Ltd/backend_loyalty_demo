const mongoose = require("mongoose");
const TriggerServices = require("../models/trigger_services_model");
const TriggerEvent = require("../models/trigger_event_model");
const { logger } = require("../middlewares/logger");

/**
 * Seed trigger services
 */
const seedTriggerServices = async () => {
  try {
    // Check if trigger services already exist
    const existingTriggerServices = await TriggerServices.countDocuments();
    if (existingTriggerServices > 0) {
      logger.info(
        "Trigger services already seeded. Skipping trigger services seed."
      );
      return;
    }

    // Get trigger events to reference
    const purchaseEvent = await TriggerEvent.findOne({ name: "Purchase" });
    const rechargeEvent = await TriggerEvent.findOne({ name: "Recharge" });
    const billPaymentEvent = await TriggerEvent.findOne({
      name: "Bill Payment",
    });

    // If no events found, log warning and exit
    if (!purchaseEvent || !rechargeEvent || !billPaymentEvent) {
      logger.warn(
        "Required trigger events not found. Please seed trigger events first."
      );
      return;
    }

    const triggerServices = [
      {
        title: "Retail Purchase",
        description: "Points for retail store purchases",
        triggerEvent: purchaseEvent._id,
      },
      {
        title: "Online Shopping",
        description: "Points for online shopping purchases",
        triggerEvent: purchaseEvent._id,
      },
      {
        title: "Mobile Recharge",
        description: "Points for mobile phone recharges",
        triggerEvent: rechargeEvent._id,
      },
      {
        title: "Internet Package",
        description: "Points for internet package purchases",
        triggerEvent: rechargeEvent._id,
      },
      {
        title: "Electricity Bill",
        description: "Points for electricity bill payments",
        triggerEvent: billPaymentEvent._id,
      },
      {
        title: "Water Bill",
        description: "Points for water bill payments",
        triggerEvent: billPaymentEvent._id,
      },
      {
        title: "Telecom Bill",
        description: "Points for telecom bill payments",
        triggerEvent: billPaymentEvent._id,
      },
    ];

    // Save all trigger services
    await TriggerServices.insertMany(triggerServices);

    logger.info("Trigger services seeded successfully!");
  } catch (error) {
    logger.error(`Error seeding trigger services: ${error.message}`);
  }
};

module.exports = seedTriggerServices;
