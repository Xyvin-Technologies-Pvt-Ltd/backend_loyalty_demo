const response_handler = require("../../helpers/response_handler");
const PaymentMethod = require("../../models/payment_method");

const getPaymentMethods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipCount = (page - 1) * limit;

    const filter = {};

    const paymentMethods = await PaymentMethod.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();

    const total_count = await PaymentMethod.countDocuments();

    return response_handler(
      res,
      200,
      "Payment methods retrieved successfully",
      paymentMethods,
      total_count
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      "Error retrieving payment methods",
      error
    );
  }
};

const createPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.create(req.body);
    return response_handler(
      res,
      201,
      "Payment method created successfully",
      paymentMethod
    );
  } catch (error) {
    return response_handler(res, 500, "Error creating payment method", error);
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return response_handler(
      res,
      200,
      "Payment method updated successfully",
      paymentMethod
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      "Error retrieving payment methods",
      error
    );
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
    return response_handler(
      res,
      200,
      "Payment method deleted successfully",
      paymentMethod
    );
  } catch (error) {
    return response_handler(res, 500, "Error deleting payment method", error);
  }
};

const getPaymentMethodById = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    return response_handler(
      res,
      200,
      "Payment method retrieved successfully",
      paymentMethod
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      "Error retrieving payment methods",
      error
    );
  }
};

module.exports = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getPaymentMethodById,
};
