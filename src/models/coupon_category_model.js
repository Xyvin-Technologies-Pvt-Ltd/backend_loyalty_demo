const mongoose = require('mongoose');

const couponCategorySchema = new mongoose.Schema({
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

const CouponCategory = mongoose.model('CouponCategory', couponCategorySchema);

module.exports = CouponCategory;
