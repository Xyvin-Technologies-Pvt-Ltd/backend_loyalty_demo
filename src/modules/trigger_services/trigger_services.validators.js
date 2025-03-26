    const Joi = require('joi');

    const create_trigger_services = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        icon: Joi.string().required(),
        triggerEvent: Joi.array().items(Joi.string()).required()
    });
    const update_trigger_services = Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        icon: Joi.string().optional(),
        triggerEvent: Joi.array().items(Joi.string()).optional()
    }); 
    
    module.exports = {
        create_trigger_services,
        update_trigger_services
    };
    
