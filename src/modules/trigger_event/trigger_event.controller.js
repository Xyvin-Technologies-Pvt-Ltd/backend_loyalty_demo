const TriggerEvent = require("../../models/trigger_event_model");
const response_handler = require("../../helpers/response_handler");
const validator = require("./trigger_event.validator");

exports.createTriggerEvent = async (req, res) => {
  try {
    const { error } = validator.create_trigger_event.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }
    const new_trigger_event = await TriggerEvent.create(req.body);
    return response_handler(
      res,
      201,
      "Trigger event created successfully!",
      new_trigger_event
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.getAllTriggerEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipCount = (page - 1) * limit;
    const filter = {};
    const trigger_events = await TriggerEvent.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();
    const total_count = await TriggerEvent.countDocuments();
    return response_handler(
      res,
      200,
      "Trigger events fetched successfully!",
      trigger_events,
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

exports.getTriggerEventById = async (req, res) => {
  try {
    const trigger_event = await TriggerEvent.findById(req.params.id);
    if (!trigger_event) {
      return response_handler(res, 404, "Trigger event not found!");
    }
    return response_handler(
      res,
      200,
      "Trigger event fetched successfully!",
      trigger_event
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.updateTriggerEvent = async (req, res) => {
  try {
    const { error } = validator.update_trigger_event.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }
    const trigger_event = await TriggerEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!trigger_event) {
      return response_handler(res, 404, "Trigger event not found!");
    }
    return response_handler(
      res,
      200,
      "Trigger event updated successfully!",
      trigger_event
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.deleteTriggerEvent = async (req, res) => {
  try {
    const trigger_event = await TriggerEvent.findByIdAndDelete(req.params.id);
    if (!trigger_event) {
      return response_handler(res, 404, "Trigger event not found!");
    }
    return response_handler(res, 200, "Trigger event deleted successfully!");
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};
