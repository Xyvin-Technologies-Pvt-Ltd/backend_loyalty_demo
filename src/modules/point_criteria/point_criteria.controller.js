const response_handler = require("../../helpers/response_handler");
const Criteria = require("../../models/point_criteria_model");
const pointsCriteriaValidationSchema = require("./point_criteria.validator");
const TriggerEvent = require("../../models/trigger_event_model");
const TriggerServices = require("../../models/trigger_services_model");

exports.create = async (req, res) => {
  try {
    const { error } = pointsCriteriaValidationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    //find event name and service name from eventType and serviceType
    const event = await TriggerEvent.findById(req.body.eventType);
    const service = await TriggerServices.findById(req.body.serviceType);

    let uniqueCode = generateUniqueCode(event.name.en, service.title.en);

    //check if unique_code already exists
    const existingCriteria = await Criteria.findOne({
      unique_code: uniqueCode,
    });
    if (existingCriteria) {
      uniqueCode = generateUniqueCode(event.name.en, service.title);
    }

    req.body.unique_code = uniqueCode;

    const new_criteria = await Criteria.create(req.body);

    return response_handler(
      res,
      201,
      "Criteria created successfully!",
      new_criteria
    );
  } catch (error) {
    console.error(error);
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.list = async (req, res) => {
  try {
    const { appType } = req.query;

    const filter = {};
    if (appType) {
      filter.appType = appType;
    }
    const criteria = await Criteria.find(filter)
      .populate("eventType")
      .populate("serviceType")
      .populate("appType");
    return response_handler(
      res,
      200,
      "Criteria fetched successfully!",
      criteria
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.get_criteria = async (req, res) => {
  try {
    const { id } = req.params;
    const criteria = await Criteria.findById(id)
      .populate("eventType")
      .populate("serviceType")
      .populate("appType");
    return response_handler(
      res,
      200,
      "Criteria fetched successfully!",
      criteria
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.update_criteria = async (req, res) => {
  try {
    const { id } = req.params;

    const updated_criteria = await Criteria.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return response_handler(
      res,
      200,
      "Criteria updated successfully!",
      updated_criteria
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.delete_criteria = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted_criteria = await Criteria.findByIdAndDelete(id);
    return response_handler(
      res,
      200,
      "Criteria deleted successfully!",
      deleted_criteria
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

const generateUniqueCode = (eventName, serviceTypeName) => {
  const sanitizedEvent = eventName
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 3); // First 3 letters of event name
  const sanitizedService = serviceTypeName
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 3); // First 3 letters of service type
  const randomDigits = Math.floor(100 + Math.random() * 900); // Generate a 3-digit number

  return `${sanitizedEvent}-${sanitizedService}-${randomDigits}`;
};



