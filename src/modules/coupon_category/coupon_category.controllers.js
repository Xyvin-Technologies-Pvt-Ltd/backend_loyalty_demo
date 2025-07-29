const CouponCategory = require("../../models/coupon_category_model");
const response_handler = require("../../helpers/response_handler");
const { createCouponCategory } = require("./coupon_category.validator");

exports.createCouponCategory = async (req, res) => {
  try {
    const { error } = createCouponCategory.validate(req.body);
    if (error) {
      return response_handler(
        res,
        400,
        "Invalid request body",
        error.details[0].message
      );
    }

    const { title, description, image } = req.body;
    const couponCategory = new CouponCategory({ title, description, image, priority: 0 });
    await couponCategory.save();
    return response_handler(
      res,
      201,
      "Coupon category created successfully",
      couponCategory
    );
  } catch (error) {
    return response_handler(res, 500, "Error creating coupon category", error);
  }
};

exports.getAllCouponCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipCount = (page - 1) * limit;

    const filter = {};
    const couponCategories = await CouponCategory.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();

    const total_count = await CouponCategory.countDocuments();
    return response_handler(
      res,
      200,
      "Coupon categories retrieved successfully",
      couponCategories,
      total_count
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      "Error retrieving coupon categories",
      error
    );
  }
};

exports.getCouponCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const couponCategory = await CouponCategory.findById(id);
    return response_handler(
      res,
      200,
      "Coupon category retrieved successfully",
      couponCategory
    );
  } catch (error) {
    return response_handler(
      res,
      500,
      "Error retrieving coupon category",
      error
    );
  }
};

exports.updateCouponCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, priority } = req.body;
    const couponCategory = await CouponCategory.findByIdAndUpdate(
      id,
      { title, description, image , priority},
      { new: true }
    );
    return response_handler(
      res,
      200,
      "Coupon category updated successfully",
      couponCategory
    );
  } catch (error) {
    return response_handler(res, 500, "Error updating coupon category", error);
  }
};

exports.deleteCouponCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await CouponCategory.findByIdAndDelete(id);
    return response_handler(res, 200, "Coupon category deleted successfully");
  } catch (error) {
    return response_handler(res, 500, "Error deleting coupon category", error);
  }
};
