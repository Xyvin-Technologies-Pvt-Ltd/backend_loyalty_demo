const Joi = require("joi");

const create_trigger_services = Joi.object({
  title: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required(),
  }),
  description: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required(),
  }),
  icon: Joi.string().required(),
  triggerEvent: Joi.array().items(Joi.string()).required(),
});
const update_trigger_services = Joi.object({
  title: Joi.object({
    en: Joi.string().optional(),
    ar: Joi.string().optional(),
  }),
  description: Joi.object({
    en: Joi.string().optional(),
    ar: Joi.string().optional(),
  }),
  icon: Joi.string().optional(),
  triggerEvent: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  create_trigger_services,
  update_trigger_services,
};
