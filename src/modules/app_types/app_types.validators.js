const Joi = require('joi');

const appTypeSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().required(),
  description: Joi.string().required(),
  isActive: Joi.boolean().required(),
});

module.exports = { appTypeSchema };


