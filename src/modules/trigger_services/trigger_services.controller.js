const response_handler = require("../../helpers/response_handler");
const TriggerServices = require("../../models/trigger_services_model");
const validator = require("./trigger_services.validators");  



exports.createTriggerServices = async (req, res) => {
    try {
        const { error } = validator.create_trigger_services.validate(req.body, {
            abortEarly: false
        });
        if (error) {
            const error_messages = error.details.map(err => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }
        const new_trigger_services = await TriggerServices.create(req.body);
        return response_handler(res, 201, "Trigger services created successfully!", new_trigger_services);
    } catch (error) {
        return response_handler(res, 500, `Internal Server Error. ${error.message}`);
    }
}


exports.getAllTriggerServices = async (req, res) => {
    try {
        const trigger_services = await TriggerServices.find();
        return response_handler(res, 200, "Trigger services fetched successfully!", trigger_services);
    } catch (error) {
        return response_handler(res, 500, `Internal Server Error. ${error.message}`);
    }
}




exports.getTriggerServicesById = async (req, res) => {
    try {
        const trigger_services = await TriggerServices.findById(req.params.id);
        return response_handler(res, 200, "Trigger services fetched successfully!", trigger_services);
    } catch (error) {
        return response_handler(res, 500, `Internal Server Error. ${error.message}`);
    }
}





exports.updateTriggerServices = async (req, res) => {
    try {
        const { error } = validator.update_trigger_services.validate(req.body, {
            abortEarly: false
        });
        if (error) {
            const error_messages = error.details.map(err => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }
        const updated_trigger_services = await TriggerServices.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return response_handler(res, 200, "Trigger services updated successfully!", updated_trigger_services);
    } catch (error) {
        return response_handler(res, 500, `Internal Server Error. ${error.message}`);
    }
}


exports.deleteTriggerServices = async (req, res) => {
    try {
        await TriggerServices.findByIdAndDelete(req.params.id);
        return response_handler(res, 200, "Trigger services deleted successfully!");
    } catch (error) {
        return response_handler(res, 500, `Internal Server Error. ${error.message}`);
    }
}

exports.getTriggerServicesByEventId = async (req, res) => {
    try {
        const trigger_services = await TriggerServices.find({ triggerEvent: req.params.eventId });
        return response_handler(res, 200, "Trigger services fetched successfully!", trigger_services);
    } catch (error) {
        return response_handler(res, 500, `Internal Server Error. ${error.message}`);
    }
}




