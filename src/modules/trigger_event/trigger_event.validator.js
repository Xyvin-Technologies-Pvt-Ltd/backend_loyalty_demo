const Joi = require("joi");

const create_trigger_event = Joi.object({
  name: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().allow(""),
  }),
  description: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().allow(""),
  }),
  tags: Joi.array().items(Joi.string()).required(),
});

const update_trigger_event = Joi.object({
  name: Joi.object({
    en: Joi.string().optional(),
    ar: Joi.string().optional().allow(""),
  }),
  description: Joi.object({
    en: Joi.string().optional(),
    ar: Joi.string().optional().allow(""),
  }),
  tags: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  create_trigger_event,
  update_trigger_event,
};
