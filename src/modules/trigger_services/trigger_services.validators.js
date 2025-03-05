    const Joi = require('joi');

    const create_trigger_services = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        triggerEvent: Joi.string().required()
    });
    const update_trigger_services = Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        triggerEvent: Joi.string().optional()
    }); 
    
    module.exports = {
        create_trigger_services,
        update_trigger_services
    };
    
