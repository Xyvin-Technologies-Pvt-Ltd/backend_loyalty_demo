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
                description: "Silver tier description",
                points_required: 1000
            },
            {
                name: "Gold",
                description: "Gold tier description",
                points_required: 2000
            },
            {
                name: "Platinum",
                description: "Platinum tier description",
                points_required: 3000
            },
   
        ];

        // Save all roles
        await Tier.insertMany(tiers);

        logger.info("Roles seeded successfully!");
    } catch (error) {
        logger.error(`Error seeding roles: ${error.message}`);
    }
};

module.exports = seedTiers; 