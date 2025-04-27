const Joi = require('joi');

const createCouponCategory = Joi.object({
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

const updateCouponCategory = Joi.object({
  title: Joi.object({
    en: Joi.string(),
    ar: Joi.string(),
  }),
  description: Joi.object({
    en: Joi.string(),
    ar: Joi.string(),
  }),
  status: Joi.string().required(),
  image: Joi.string().required(),
});

module.exports = {
  createCouponCategory,
  updateCouponCategory,
};




