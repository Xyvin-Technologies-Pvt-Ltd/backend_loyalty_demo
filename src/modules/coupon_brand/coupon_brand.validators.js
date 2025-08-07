const Joi = require('joi');

const createCouponBrand = Joi.object({
  title: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required().allow(""),
  }),
  description: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required().allow(""),
  }),
  image: Joi.string().required(),
  priority: Joi.number(),
});

const updateCouponBrand = Joi.object({
  title: Joi.object({
    en: Joi.string(),
    ar: Joi.string().allow(""),
  }),
  description: Joi.object({
    en: Joi.string(), 
    ar: Joi.string().allow(""),
  }),
  image: Joi.string().required(),
  priority: Joi.number(),
});

module.exports = {
  createCouponBrand,
  updateCouponBrand,
};

