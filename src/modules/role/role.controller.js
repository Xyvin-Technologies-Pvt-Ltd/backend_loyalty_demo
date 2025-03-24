const Role = require("../../models/role_model");
const validator = require("./role.validator");
const response_handler = require("../../helpers/response_handler");

exports.create = async (req, res) => {
  try {
    const { error } = validator.create_role.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    const new_role = await Role.create(req.body);

    return response_handler(res, 201, "Role created successfully!", new_role);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.update_role = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validator.update_role.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    const updated_role = await Role.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return response_handler(
      res,
      200,
      "Role updated successfully!",
      updated_role
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.delete_role = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted_role = await Role.findByIdAndDelete(id);
    return response_handler(
      res,
      200,
      "Role deleted successfully!",
      deleted_role
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.get_role = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    return response_handler(res, 200, "Role fetched successfully!", role);
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
    const roles = await Role.find();
    return response_handler(res, 200, "Roles fetched successfully!", roles);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};
