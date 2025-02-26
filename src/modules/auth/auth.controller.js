const response_handler = require("../../helpers/response_handler");
const Admin = require("../../models/admin_model");
const User = require("../../models/user_model");
const { hash_password, compare_passwords } = require("../../utils/bcrypt");
const { generate_token } = require("../../utils/generate_token");
const validator = require("./auth.validator");

exports.signup = async (req, res) => {
  try {
    const { error } = validator.signup.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    const existing_user = await Admin.findOne({ email: req.body.email });
    if (existing_user) {
      return response_handler(res, 400, "User already exists with this email.");
    }

    req.body.password = await hash_password(req.body.password, 10);
    const new_user = await Admin.create(req.body);
    return response_handler(res, 201, "Signup successful!", new_user);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = validator.login.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    const user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      return response_handler(res, 400, "User not found.");
    }

    const is_password_valid = await compare_passwords(
      req.body.password,
      user.password
    );
    if (!is_password_valid) {
      return response_handler(res, 400, "Invalid password.");
    }

    const jwt_token = generate_token(user._id);

    return response_handler(res, 200, "Login successful!", jwt_token);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.register = async (req, res) => {
  try {
    const { error } = validator.register.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }

    const existing_user = await User.findOne({
      $or: [
        { email: req.body.email },
        { phone: req.body.phone },
        { customer_id: req.body.customer_id },
      ],
    });

    if (existing_user) {
      const jwt_token = generate_token(existing_user._id);
      return response_handler(res, 200, "Login successful!", jwt_token);
    } else {
      const new_user = await User.create(req.body);
      const jwt_token = generate_token(new_user._id);
      return response_handler(res, 200, "Login successful!", jwt_token);
    }
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};
