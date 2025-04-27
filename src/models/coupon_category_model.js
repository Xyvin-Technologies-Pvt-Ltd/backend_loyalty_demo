const mongoose = require("mongoose");

const couponCategorySchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },

  image: {
    type: String,
  },
});

const CouponCategory = mongoose.model("CouponCategory", couponCategorySchema);

module.exports = CouponCategory;
