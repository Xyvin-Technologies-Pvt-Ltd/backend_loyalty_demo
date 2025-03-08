const Joi = require("joi");

exports.createCoinConversionRuleValidator = Joi.object({
  pointsPerCoin: Joi.number().required(),
  minimumPoints: Joi.number().required(),
  tierBonuses: Joi.object().required(),
});

exports.updateCoinConversionRuleValidator = Joi.object({
  pointsPerCoin: Joi.number().required(),
  minimumPoints: Joi.number().required(),
  tierBonuses: Joi.object().required(),
});


