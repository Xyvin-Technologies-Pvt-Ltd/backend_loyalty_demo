const mongoose = require("mongoose");
const TriggerEvent = require("../models/trigger_event_model");
const { logger } = require("../middlewares/logger");

/**
 * Seed trigger events
 */
const seedTriggerEvents = async () => {
  try {
    // Check if trigger events already exist
    const existingTriggerEvents = await TriggerEvent.countDocuments();
    if (existingTriggerEvents > 0) {
      logger.info(
        "Trigger events already seeded. Skipping trigger event seed."
      );
      return;
    }

    const triggerEvents = [
      {
        name: "Purchase",
        description: "Points earned when a customer makes a purchase",
        tags: ["transaction", "purchase", "retail"],
      },
      {
        name: "Registration",
        description: "Points earned when a new user registers",
        tags: ["onboarding", "signup", "new-user"],
      },
      {
        name: "Referral",
        description: "Points earned when a customer refers a friend",
        tags: ["referral", "acquisition", "growth"],
      },
      {
        name: "Social Share",
        description: "Points earned when a customer shares on social media",
        tags: ["social", "engagement", "marketing"],
      },
      {
        name: "Review",
        description: "Points earned when a customer leaves a review",
        tags: ["feedback", "review", "engagement"],
      },
      {
        name: "Birthday",
        description: "Points earned on customer's birthday",
        tags: ["birthday", "special-event", "celebration"],
      },
      {
        name: "App Login",
        description: "Points earned when a customer logs into the app",
        tags: ["engagement", "app-usage", "retention"],
      },
      {
        name: "Bill Payment",
        description: "Points earned when a customer pays a bill",
        tags: ["payment", "utility", "service"],
      },
      {
        name: "Recharge",
        description: "Points earned when a customer recharges mobile/services",
        tags: ["telecom", "recharge", "service"],
      },
    ];

    // Save all trigger events
    await TriggerEvent.insertMany(triggerEvents);

    logger.info("Trigger events seeded successfully!");
  } catch (error) {
    logger.error(`Error seeding trigger events: ${error.message}`);
  }
};

module.exports = seedTriggerEvents;
