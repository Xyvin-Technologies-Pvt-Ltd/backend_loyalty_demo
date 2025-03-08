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
        icon: "https://via.placeholder.com/150",
        tags: ["transaction", "purchase", "retail"],
      },
      {
        name: "Registration",
        description: "Points earned when a new user registers",
        icon: "https://via.placeholder.com/150",
        tags: ["onboarding", "signup", "new-user"],
      },
      {
        name: "Referral",
        description: "Points earned when a customer refers a friend",
        icon: "https://via.placeholder.com/150",
        tags: ["referral", "acquisition", "growth"],
      },
      {
        name: "Social Share",
        description: "Points earned when a customer shares on social media",
        icon: "https://via.placeholder.com/150",
        tags: ["social", "engagement", "marketing"],
      },
      {
        name: "Review",
        description: "Points earned when a customer leaves a review",
        icon: "https://via.placeholder.com/150",
        tags: ["feedback", "review", "engagement"],
      },
      {
        name: "Birthday",
        description: "Points earned on customer's birthday",
        icon: "https://via.placeholder.com/150",
        tags: ["birthday", "special-event", "celebration"],
      },
      {
        name: "App Login",
        description: "Points earned when a customer logs into the app",
        icon: "https://via.placeholder.com/150",
        tags: ["engagement", "app-usage", "retention"],
      },
      {
        name: "Bill Payment",
        description: "Points earned when a customer pays a bill",
        icon: "https://via.placeholder.com/150",
        tags: ["payment", "utility", "service"],
      },
      {
        name: "Recharge",
        description: "Points earned when a customer recharges mobile/services",
        icon: "https://via.placeholder.com/150",
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
