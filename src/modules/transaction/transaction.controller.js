const validator = require("./transaction.validator");
const response_handler = require("../../helpers/response_handler");
const Transaction = require("../../models/transaction_model");

exports.create = async (req, res) => {
  try {
    const { error } = validator.create_transaction.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const error_messages = error.details.map((err) => err.message).join(", ");
      return response_handler(res, 400, `Invalid input: ${error_messages}`);
    }
    req.body.user = req.user_id;
    const new_transaction = await Transaction.create(req.body);
    return response_handler(
      res,
      201,
      "Transaction created successfully!",
      new_transaction
    );
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
    const filter = {};
    if (req.user) {
      filter.user = req.user_id;
    }
    const transactions = await Transaction.find(filter);
    return response_handler(
      res,
      200,
      "Transactions fetched successfully!",
      transactions
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};
