const Joi = require("joi");

exports.createCoinConversionRuleValidator = Joi.object({
  pointsPerCoin: Joi.number().required(),
  minimumPoints: Joi.number().required(),
});

exports.updateCoinConversionRuleValidator = Joi.object({
  pointsPerCoin: Joi.number().required(),
  minimumPoints: Joi.number().required(),
});


