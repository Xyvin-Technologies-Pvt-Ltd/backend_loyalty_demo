const Joi = require("joi");

const create_trigger_services = Joi.object({
  title: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required().allow(""),
  }),
  description: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required().allow(""),
  }),
  icon: Joi.string().required(),
  triggerEvent: Joi.array().items(Joi.string()).required(),
});
const update_trigger_services = Joi.object({
  title: Joi.object({
    en: Joi.string().optional(),
    ar: Joi.string().optional().allow(""),
  }),
  description: Joi.object({
    en: Joi.string().optional(),
    ar: Joi.string().optional().allow(""),
  }),
  icon: Joi.string().optional(),
  triggerEvent: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  create_trigger_services,
  update_trigger_services,
};
