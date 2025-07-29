const mongoose = require("mongoose");

const couponBrandSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String },
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String },
  },
  image: {
    type: String,
  },
  priority: {
    type: Number,
    default: 0,
  },
});

const CouponBrand = mongoose.model("CouponBrand", couponBrandSchema);

module.exports = CouponBrand;
