const Joi = require('joi');

const appTypeSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.boolean().required(),
});

module.exports = { appTypeSchema };


