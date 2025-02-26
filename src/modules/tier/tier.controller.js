const response_handler = require("../../helpers/response_handler");
const Tier = require("../../models/tier_model");
const validator = require("./tier.validator");

exports.create = async (req, res) => {
  try {
    const { error } = validator.create_tier.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    const new_tier = await Tier.create(req.body);

    return response_handler(res, 201, "Tier created successfully!", new_tier);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.list = async (req, res) => {
  try {
    const tiers = await Tier.find();
    return response_handler(res, 200, "Tiers fetched successfully!", tiers);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.get_tier = async (req, res) => {
  try {
    const { id } = req.params;
    const tier = await Tier.findById(id);
    return response_handler(res, 200, "Tier fetched successfully!", tier);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.update_tier = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validator.update_tier.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    const updated_tier = await Tier.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return response_handler(
      res,
      200,
      "Tier updated successfully!",
      updated_tier
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.delete_tier = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted_tier = await Tier.findByIdAndDelete(id);
    return response_handler(
      res,
      200,
      "Tier deleted successfully!",
      deleted_tier
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};
