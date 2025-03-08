const Joi = require('joi');

const create_trigger_event = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    icon: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required()
});

const update_trigger_event = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    icon: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional()
});

module.exports = {
    create_trigger_event,
    update_trigger_event
};


