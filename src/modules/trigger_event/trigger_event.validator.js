const Joi = require('joi');

const create_trigger_event = Joi.object({
    name: Joi.object({
        en: Joi.string().required(),
        ar: Joi.string().required(),
    }),
    description: Joi.object({
        en: Joi.string().required(),
        ar: Joi.string().required(),
    }),
    tags: Joi.array().items(Joi.string()).required()
});

const update_trigger_event = Joi.object({
    name: Joi.object({
        en: Joi.string().optional(),
        ar: Joi.string().optional(),
    }),
    description: Joi.object({
        en: Joi.string().optional(),
        ar: Joi.string().optional(),
    }),
    tags: Joi.array().items(Joi.string()).optional()
});

module.exports = {
    create_trigger_event,
    update_trigger_event
};


