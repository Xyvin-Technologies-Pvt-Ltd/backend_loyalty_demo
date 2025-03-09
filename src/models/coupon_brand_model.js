const mongoose = require('mongoose');

const couponBrandSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  
}); 

const CouponBrand = mongoose.model('CouponBrand', couponBrandSchema);

module.exports = CouponBrand;
