const Transaction = require('../models/transaction_model');
const Customer = require('../models/customer_model');
const PointsExpirationRules = require('../models/points_expiration_rules_model');
const { logger } = require('../middlewares/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed transaction data
 */
async function seedTransactions() {
    try {
        // Check if transactions already exist
        const existingTransactions = await Transaction.countDocuments();

        if (existingTransactions > 0) {
            logger.info(`${existingTransactions} transactions already exist, skipping seed`);
            return;
        }

        // Get some users to associate transactions with
        const users = await Customer.find().limit(5);

        if (users.length === 0) {
            logger.info('No users found to seed transactions, skipping');
            return;
        }

        // Get expiration rules to calculate expiry dates
        const expirationRules = await PointsExpirationRules.getActiveRules();
        const defaultExpiryPeriod = expirationRules ? expirationRules.default_expiry_period : 12; // Default to 12 months

        const transactionTypes = ['earning', 'redemption', 'referral', 'other'];
        const statuses = ['pending', 'completed', 'rejected', 'cancelled'];
        const rewardTypes = ['gift_card', 'discount', 'product', 'service'];

        const sampleTransactions = [];

        // Create sample transactions for each user
        for (const user of users) {
            // Create earning transactions
            for (let i = 0; i < 3; i++) {
                const transactionDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
                const points = Math.floor(Math.random() * 500) + 100;

                // Calculate expiry date based on transaction date and expiry period
                const expiryDate = new Date(transactionDate);
                expiryDate.setMonth(expiryDate.getMonth() + defaultExpiryPeriod);

                sampleTransactions.push({
                    user: user._id,
                    points: points,
                    points_remaining: points, // Initially, points_remaining equals points
                    type: 'earning',
                    status: 'completed',
                    transaction_date: transactionDate,
                    expiry_date: expiryDate,
                    is_expired: false,
                    merchant: `Merchant ${i + 1}`,
                    note: { message: `Purchase at Merchant ${i + 1}` },
                    provider: 'POS',
                    app: 'Khedmah Payment'
                });
            }

            // Create redemption transactions
            for (let i = 0; i < 2; i++) {
                const rewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
                const points = Math.floor(Math.random() * 300) + 100;
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let rewardDetails = {};
                if (rewardType === 'gift_card') {
                    rewardDetails = {
                        provider: 'Amazon',
                        value: Math.floor(points / 10),
                        currency: 'USD'
                    };
                } else if (rewardType === 'discount') {
                    rewardDetails = {
                        percentage: Math.floor(Math.random() * 30) + 10,
                        code: `DISC${Math.floor(Math.random() * 1000)}`
                    };
                } else if (rewardType === 'product') {
                    rewardDetails = {
                        name: `Product ${i + 1}`,
                        sku: `SKU${Math.floor(Math.random() * 10000)}`
                    };
                } else {
                    rewardDetails = {
                        name: `Service ${i + 1}`,
                        duration: `${Math.floor(Math.random() * 12) + 1} months`
                    };
                }

                sampleTransactions.push({
                    user: user._id,
                    points: points,
                    type: 'redemption',
                    status: status,
                    transaction_date: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
                    reward_type: rewardType,
                    reward_details: rewardDetails,
                    transaction_reference: uuidv4(),
                    note: { message: `Redemption for ${rewardType}` }
                });
            }

            // Create referral transaction
            sampleTransactions.push({
                user: user._id,
                points: 200,
                points_remaining: 200, // Initially, points_remaining equals points
                type: 'referral',
                status: 'completed',
                transaction_date: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
                expiry_date: new Date(Date.now() + defaultExpiryPeriod * 30 * 24 * 60 * 60 * 1000), // Expiry date for referral points
                is_expired: false,
                note: { message: 'Referral bonus' },
                provider: 'App',
                app: 'Khedmah Loyalty'
            });
        }

        // Insert sample transactions
        await Transaction.insertMany(sampleTransactions);
        logger.info(`${sampleTransactions.length} transactions seeded successfully`);
    } catch (error) {
        logger.error(`Error seeding transactions: ${error.message}`, { stack: error.stack });
    }
}

module.exports = seedTransactions; 