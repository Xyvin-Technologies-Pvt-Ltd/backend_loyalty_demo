const response_handler = require("../../helpers/response_handler");
const Criteria = require("../../models/point_criteria_model");
const pointsCriteriaValidationSchema = require("./point_criteria.validator");

exports.create = async (req, res) => {
  try {
    const { error } = pointsCriteriaValidationSchema.validate(req.body, {  
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

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
    const criteria = await Criteria.find();
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
    const criteria = await Criteria.findById(id);
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
    const { error } = validator.update_criteria.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

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
