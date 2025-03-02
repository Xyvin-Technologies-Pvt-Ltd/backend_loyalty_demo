const SDKAccessKey = require("../models/sdk_access_key_model");
const { logger } = require("../middlewares/logger");

/**
 * Seed SDK access keys
 */
const seedSDKAccessKeys = async () => {
    try {
        // Check if SDK access keys already exist
        const existingKeys = await SDKAccessKey.countDocuments();
        if (existingKeys > 0) {
            logger.info("SDK access keys already seeded. Skipping SDK access key seed.");
            return;
        }

        // Generate a development key
        const devKey = SDKAccessKey.generateKey();
        const developmentKey = new SDKAccessKey({
            name: "Development Key",
            description: "For development and testing purposes",
            client: {
                name: "Internal Development Team",
                email: "dev@khedmah.com",
                company: "Khedmah",
                website: "https://khedmah.com"
            },
            key: devKey,
            permissions: {
                user_data: true,
                transactions: true,
                points: true,
                redemptions: true
            },
            environment: "development",
            status: "active"
        });

        // Generate a mobile app key
        const mobileKey = SDKAccessKey.generateKey();
        const mobileAppKey = new SDKAccessKey({
            name: "Mobile App Key",
            description: "For the Khedmah mobile application",
            client: {
                name: "Mobile App Team",
                email: "mobile@khedmah.com",
                company: "Khedmah",
                website: "https://khedmah.com"
            },
            key: mobileKey,
            permissions: {
                user_data: true,
                transactions: true,
                points: true,
                redemptions: true
            },
            environment: "production",
            status: "active"
        });

        // Generate a partner integration key
        const partnerKey = SDKAccessKey.generateKey();
        const partnerIntegrationKey = new SDKAccessKey({
            name: "Partner Integration",
            description: "For partner website integration",
            client: {
                name: "Partner Integration",
                email: "partner@example.com",
                company: "Partner Company",
                website: "https://partner-example.com"
            },
            key: partnerKey,
            permissions: {
                user_data: true,
                transactions: true,
                points: false,
                redemptions: false
            },
            environment: "production",
            status: "active",
            rate_limit: {
                requests_per_minute: 30,
                requests_per_day: 5000
            }
        });

        // Save all keys
        await SDKAccessKey.insertMany([developmentKey, mobileAppKey, partnerIntegrationKey]);

        logger.info("SDK access keys seeded successfully!");
        logger.info(`Development Key: ${devKey} (save this for development use)`);
    } catch (error) {
        logger.error(`Error seeding SDK access keys: ${error.message}`);
    }
};

module.exports = seedSDKAccessKeys; 