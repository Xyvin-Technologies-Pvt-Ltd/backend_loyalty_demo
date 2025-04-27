const mongoose = require('mongoose');

const couponBrandSchema = new mongoose.Schema({
  title: {
  en:{ type: String, required: true },
  ar:{ type: String, required: true },
  },
  description: {
    en:{ type: String, required: true },
    ar:{ type: String, required: true },
  },
  image: {
    type: String,
  },
  
}); 

const CouponBrand = mongoose.model('CouponBrand', couponBrandSchema);

module.exports = CouponBrand;
