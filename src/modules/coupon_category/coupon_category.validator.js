const Joi = require("joi");

const createCouponCategory = Joi.object({
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

const updateCouponCategory = Joi.object({
  title: Joi.object({
    en: Joi.string(),
    ar: Joi.string().allow(""),
  }),
  description: Joi.object({
    en: Joi.string(),
    ar: Joi.string().allow(""),
  }),
  status: Joi.string().required(),
  image: Joi.string().required(),
  priority: Joi.number(),
});

module.exports = {
  createCouponCategory,
  updateCouponCategory,
};
