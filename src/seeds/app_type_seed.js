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
        name: "Mobile App",
        description: "Native mobile application for loyalty program",
        status: true,
      },
      {
        name: "Web Portal",
        description: "Web-based portal for loyalty program management",
        status: true,
      },
      {
        name: "Kiosk",
        description: "Self-service kiosk application for in-store loyalty",
        status: true,
      },
      {
        name: "POS Integration",
        description: "Point of Sale integration for loyalty program",
        status: true,
      },
      {
        name: "Partner API",
        description: "API integration for partner loyalty programs",
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
