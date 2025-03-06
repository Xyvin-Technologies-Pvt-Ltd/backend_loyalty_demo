const mongoose = require("mongoose");
const AppType = require("../models/app_type_model");
const { logger } = require("../middlewares/logger");

/**
 * Seed application types
 */
const seedAppTypes = async () => {
  try {
    // Check if app types already exist
    const existingAppTypes = await AppType.countDocuments();
    if (existingAppTypes > 0) {
      logger.info("App types already seeded. Skipping app type seed.");
      return;
    }

    const appTypes = [
      {
        name: "Khedmah pay",
        description: "Native mobile application for Payment",
        status: true,
      },
      {
        name: "Khedmah Delivery",
        description: "Native mobile application for Delivery",
        status: true,
      },
    ];

    // Save all app types
    await AppType.insertMany(appTypes);

    logger.info("App types seeded successfully!");
  } catch (error) {
    logger.error(`Error seeding app types: ${error.message}`);
  }
};

module.exports = seedAppTypes;
