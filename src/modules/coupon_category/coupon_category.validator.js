const Joi = require('joi');

const createCouponCategory = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
});

const updateCouponCategory = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().required(),
  image: Joi.string().required(),
});

module.exports = {
  createCouponCategory,
  updateCouponCategory,
};




