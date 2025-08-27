const response_handler = require("../../helpers/response_handler");
const TriggerServices = require("../../models/trigger_services_model");
const validator = require("./trigger_services.validators");

exports.createTriggerServices = async (req, res) => {
  try {
    const { error } = validator.create_trigger_services.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }
    const new_trigger_services = await TriggerServices.create(req.body);
    return response_handler(
      res,
      201,
      "Trigger services created successfully!",
      new_trigger_services
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.getAllTriggerServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipCount = (page - 1) * limit;
    const searchQuery = req.query.search || "";
    const filter = {};
    if (searchQuery) {
      filter["title.en"] = { $regex: searchQuery, $options: "i" };
    }
    const trigger_services = await TriggerServices.find(filter)
      .populate("triggerEvent")
      .skip(skipCount)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();
    const total_count = await TriggerServices.countDocuments();
    return response_handler(
      res,
      200,
      "Trigger services fetched successfully!",
      trigger_services,
      total_count
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.getTriggerServicesById = async (req, res) => {
  try {
    const trigger_services = await TriggerServices.findById(
      req.params.id
    ).populate("triggerEvent");
    return response_handler(
      res,
      200,
      "Trigger services fetched successfully!",
      trigger_services
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.updateTriggerServices = async (req, res) => {
  try {
    const { error } = validator.update_trigger_services.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }
    const updated_trigger_services = await TriggerServices.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return response_handler(
      res,
      200,
      "Trigger services updated successfully!",
      updated_trigger_services
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.deleteTriggerServices = async (req, res) => {
  try {
    await TriggerServices.findByIdAndDelete(req.params.id);
    return response_handler(res, 200, "Trigger services deleted successfully!");
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.getTriggerServicesByEventId = async (req, res) => {
  try {
    const trigger_services = await TriggerServices.find({
      triggerEvent: req.params.eventId,
    });
    console.log(trigger_services, "trigger_services", req.params.eventId);
    return response_handler(
      res,
      200,
      "Trigger services fetched successfully!",
      trigger_services
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};


