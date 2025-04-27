const Joi = require('joi');

const createCouponBrand = Joi.object({
  title: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required(),
  }),
  description: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required(),
  }),
  image: Joi.string().required(),
});

const updateCouponBrand = Joi.object({
  title: Joi.object({
    en: Joi.string(),
    ar: Joi.string(),
  }),
  description: Joi.object({
    en: Joi.string(), 
    ar: Joi.string(),
  }),
  image: Joi.string().required(),
});

module.exports = {
  createCouponBrand,
  updateCouponBrand,
};

