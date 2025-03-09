const Joi = require('joi');

const createCouponBrand = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
});

const updateCouponBrand = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
});

module.exports = {
  createCouponBrand,
  updateCouponBrand,
};

