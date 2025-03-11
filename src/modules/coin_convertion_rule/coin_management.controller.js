const CoinConversionRule = require("../../models/coin_management_model");
const {
  createCoinConversionRuleValidator,
} = require("./coin_management.validator");
const response_handler = require("../../helpers/response_handler");
const { logger } = require("../../middlewares/logger");

//creation and updation of coin conversion rule
exports.createCoinConversionRule = async (req, res) => {
  try {
    const { pointsPerCoin, minimumPoints } = req.body;

    const { error } = createCoinConversionRuleValidator.validate(req.body);
    if (error) {
      return response_handler(res, 400, error.message);
    }

    //if the rule already exists then update it
    const existingRule = await CoinConversionRule.getActiveRules();

    if (existingRule) {
      existingRule.pointsPerCoin = pointsPerCoin;
      existingRule.minimumPoints = minimumPoints;
      existingRule.updatedBy = req.admin_id;
      await existingRule.save();
      logger.info(`Coin conversion rule updated by admin ${req.admin_id}`);

      return response_handler(
        res,
        200,
        "Coin conversion rule updated successfully",
        existingRule
      );
    } else {
      const newCoinConversionRule = new CoinConversionRule({
        pointsPerCoin,
        minimumPoints,
        updatedBy: req.admin_id,
      });
      await newCoinConversionRule.save();
      logger.info(`Coin conversion rule created by admin ${req.admin_id}`);
      return response_handler(
        res,
        201,
        "Coin conversion rule created successfully",
        newCoinConversionRule
      );
    }
  } catch (error) {
    return response_handler(res, 500, error.message);
  }
};

exports.getAllCoinConversionRules = async (req, res) => {
  try {
    const coinConversionRules = await CoinConversionRule.find().populate(
      "updatedBy",
      "name email"
    );
    return response_handler(
      res,
      200,
      "All coin conversion rules retrieved successfully",
      coinConversionRules
    );
  } catch (error) {
    return response_handler(res, 500, error.message);
  }
};

// create a controller to reset it to zero and denies any converstion
exports.resetCoinConversionRule = async (req, res) => {
  try {
    //find the only active rule
    const coinConversionRule = await CoinConversionRule.findOne({
      is_active: true,
    });

    const coinConversionRule2 = await CoinConversionRule.findByIdAndUpdate(
      coinConversionRule._id,
      {
        pointsPerCoin: 0,
        minimumPoints: 0,
        updatedBy: req.admin_id,
      },
      { new: true }
    );

    return response_handler(
      res,
      200,
      "Coin conversion rule reset successfully",
      coinConversionRule2
    );
  } catch (error) {
    return response_handler(res, 500, error.message);
  }
};
