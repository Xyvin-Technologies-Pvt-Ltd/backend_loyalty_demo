const CoinConversionRule = require("../models/coin_management_model");
const { logger } = require("../middlewares/logger");



const seedCoinConversionRule = async () => {
  try {
    // Check if coin conversion rule already exists
    const existingRule = await CoinConversionRule.findOne();
    if (existingRule) {
      logger.info("Coin conversion rule already exists, skipping seed");
      return;
    }   
    const coinConversionRule = await CoinConversionRule.create({
    pointsPerCoin: 10,
    minimumPoints: 100,
    tierBonuses: {
      silver: 10,
      gold: 20,
      platinum: 30,
    },
  });

    console.log("Coin conversion rule seeded successfully");
  } catch (error) {
    logger.error("Error seeding coin conversion rule", error);
  }
};

module.exports = seedCoinConversionRule;

