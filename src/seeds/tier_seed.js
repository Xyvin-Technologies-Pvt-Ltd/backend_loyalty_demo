const mongoose = require("mongoose");
const Tier = require("../models/tier_model");
const { logger } = require("../middlewares/logger");

/**
 * Seed roles with permissions that match the UI
 */
const seedTiers = async () => {
    try {
        // Check if roles already exist
        const existingTiers = await Tier.countDocuments();
        if (existingTiers > 0) {
            logger.info("Tiers already seeded. Skipping tier seed.");
            return;
        }

        const tiers = [
            {
                name: "Silver   ",
                app: "Khedmah-Merchant",
                description: "Silver tier description",
                points_required: 1000
            },
            {
                name: "Gold",
                app: "Khedmah-Merchant",
                description: "Gold tier description",
                points_required: 2000
            },
            {
                name: "Platinum",
                app: "Khedmah-Merchant",
                description: "Platinum tier description",
                points_required: 3000
            },
            {
                name: "Silver   ",
                app: "Khedmah-Mobile",
                description: "Silver tier description",
                points_required: 1000
            },
            {
                name: "Gold",
                app: "Khedmah-Mobile",
                description: "Gold tier description",
                points_required: 2000
            },
            {
                name: "Platinum",
                app: "Khedmah-Mobile",
                description: "Platinum tier description",
                points_required: 3000
            }
        ];

        // Save all roles
        await Tier.insertMany(tiers);

        logger.info("Roles seeded successfully!");
    } catch (error) {
        logger.error(`Error seeding roles: ${error.message}`);
    }
};

module.exports = seedTiers; 