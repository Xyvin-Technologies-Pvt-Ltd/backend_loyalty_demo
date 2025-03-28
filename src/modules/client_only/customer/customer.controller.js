const Customer = require("../../../models/customer_model");
const response_handler = require("../../../helpers/response_handler");
const Transaction = require("../../../models/transaction_model");

exports.getMyProfile = async (req, res) => {
  try {
    const { customer_id } = req.params; // client customer id
    const customer = await Customer.findOne({ customer_id })
      .populate("tier")
    .populate("referred_by");
  if (!customer) {
    return response_handler(res,404, "Customer not found", null);
    }
    return response_handler(res, 200, "Customer found", customer);
  } catch (error) {
    return response_handler(res, 500, error.message, null);
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const { customer_id } = req.params; // this is client customer id
    const customer = await Customer.findOne({ customer_id });
    const transactions = await Transaction.find({
      customer_id: customer._id,
    }).populate({
      path: "point_criteria",
      populate: [
        { path: "eventType" }, // Populating eventType inside point_criteria
        { path: "serviceType" }, // Populating serviceType inside point_criteria
        { path: "appType" }, // Populating appType inside point_criteria
      ],
    });
    // because transacrion has only our monogodb id
    return response_handler(res, 200, "Transactions found", transactions);
  } catch (error) {
    return response_handler(res, 500, error.message, null);
  }
};

exports.getMyPoints = async (req, res) => {
  try {
    const { customer_id } = req.params; // this is client customer id
    const customer = await Customer.findOne({ customer_id });
    if (!customer) {
      return response_handler(res, 404, "Customer not found", null);
    }
    const points = customer.points;
    return response_handler(res, 200, "Points found", points);
  } catch (error) {
    return response_handler(res, 500, error.message, null);
  }
};

exports.getMyNotificationPreferences = async (req, res) => {
  try {
    const { customer_id } = req.params; // this is client customer id
    const customer = await Customer.findOne({ customer_id });
    if (!customer) {
      return response_handler(res, 404, "Customer not found", null);
    }
    const notificationPreferences = customer.notification_preferences;
    return response_handler(res, 200, "Notification preferences found", notificationPreferences);
  } catch (error) {
    return response_handler(res, 500, error.message, null);
  }
};

exports.updateMyNotificationPreferences = async (req, res) => {
  try {
    const { customer_id } = req.params; // this is client customer id
    const { notification_preferences } = req.body;
    const customer = await Customer.findOne({ customer_id });
    if (!customer) {
      return response_handler(res, 404, "Customer not found", null);
    }
    customer.notification_preferences = notification_preferences;
    await customer.save();
    return response_handler(res, 200, "Notification preferences updated", customer);
  } catch (error) {
    return response_handler(res, 500, error.message, null);
  }
};
