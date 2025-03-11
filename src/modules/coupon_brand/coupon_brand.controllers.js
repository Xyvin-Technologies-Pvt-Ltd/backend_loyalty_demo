const CouponBrand = require("../../models/coupon_brand_model");
const response_handler = require("../../helpers/response_handler");
const { createCouponBrand } = require("./coupon_brand.validators");

exports.createCouponBrand = async (req, res) => {
  const { title, description, image } = req.body;

  try {
    const { error } = createCouponBrand.validate(req.body);
    if (error) {
      return response_handler(res, 400, "Invalid request body", error.details[0].message);
    }
    const couponBrand = new CouponBrand({ title, description, image });
    await couponBrand.save();
    return response_handler(res, 201, "Coupon brand created successfully", couponBrand);
  } catch (error) {
    return response_handler(res, 500, "Error creating coupon brand", error);
  }
};

exports.getAllCouponBrands = async (req, res) => {
    try {
        const couponBrands = await CouponBrand.find();
        return response_handler(res, 200, "Coupon brands retrieved successfully", couponBrands);
    } catch (error) {
        return response_handler(res, 500, "Error retrieving coupon brands", error);
    }
};  

exports.getCouponBrandById = async (req, res) => {
    try {
        const { id } = req.params;
        const couponBrand = await CouponBrand.findById(id);
        return response_handler(res, 200, "Coupon brand retrieved successfully", couponBrand);
    } catch (error) {
        return response_handler(res, 500, "Error retrieving coupon brand", error);
    }
};  

exports.updateCouponBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image } = req.body;
        const couponBrand = await CouponBrand.findByIdAndUpdate(id, { title, description, image }, { new: true });
        return response_handler(res, 200, "Coupon brand updated successfully", couponBrand);
    } catch (error) {
        return response_handler(res, 500, "Error updating coupon brand", error);
    }
};    

exports.deleteCouponBrand = async (req, res) => {
    try {
        const { id } = req.params;
        await CouponBrand.findByIdAndDelete(id);
        return response_handler(res, 200, "Coupon brand deleted successfully");
    } catch (error) {
        return response_handler(res, 500, "Error deleting coupon brand", error);
    }
};  