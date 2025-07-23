const TierEligibilityCriteria = require("../models/tier_eligibility_criteria_model");
const Tier = require("../models/tier_model");
const { logger } = require("../middlewares/logger");

const seedTierEligibilityCriteria = async () => {
    try {
        logger.info("Starting tier eligibility criteria seeding...");

        // Check if criteria already exist
        const existingCriteria = await TierEligibilityCriteria.countDocuments();
        if (existingCriteria > 0) {
            logger.info("Tier eligibility criteria already exist, skipping seed");
            return;
        }

        // Get tiers for Silver and Gold (assuming they exist)
        const silverTier = await Tier.findOne({ points_required: 300 });
        const goldTier = await Tier.findOne({ points_required: 450 });

        const criteriaToSeed = [];

        // Silver tier criteria (300 points + 100 net points for 90 days for 3 periods)
        if (silverTier) {
            criteriaToSeed.push({
                tier_id: silverTier._id,
                net_earning_required: 100,
                evaluation_period_days: 30, // 30 days per period (monthly)
                consecutive_periods_required: 3, // 3 consecutive periods
                app_type: null, // General criteria (applies to all app types)
                is_active: true,
                settings: {
                    require_consecutive: true,
                    grace_periods_allowed: 0
                }
            });
        }

        // Gold tier criteria (450 points + 150 net points for 90 days for 3 periods)
        if (goldTier) {
            criteriaToSeed.push({
                tier_id: goldTier._id,
                net_earning_required: 150,
                evaluation_period_days: 30, // 30 days per period (monthly)
                consecutive_periods_required: 3, // 3 consecutive periods
                app_type: null, // General criteria (applies to all app types)
                is_active: true,
                settings: {
                    require_consecutive: true,
                    grace_periods_allowed: 0
                }
            });
        }

        if (criteriaToSeed.length > 0) {
            await TierEligibilityCriteria.insertMany(criteriaToSeed);
            logger.info(`Successfully seeded ${criteriaToSeed.length} tier eligibility criteria`);
        } else {
            logger.warn("No tiers found for seeding eligibility criteria. Please ensure Silver (300 points) and Gold (450 points) tiers exist.");
        }

    } catch (error) {
        logger.error("Error seeding tier eligibility criteria:", error);
        throw error;
    }
};

module.exports = { seedTierEligibilityCriteria };

// Run seed if called directly
if (require.main === module) {
    const mongoose = require("mongoose");
    const config = require("../config/database");

    mongoose.connect(config.url, config.options)
        .then(() => {
            logger.info("Connected to MongoDB for seeding");
            return seedTierEligibilityCriteria();
        })
        .then(() => {
            logger.info("Tier eligibility criteria seeding completed");
            process.exit(0);
        })
        .catch((error) => {
            logger.error("Error during seeding:", error);
            process.exit(1);
        });
} 