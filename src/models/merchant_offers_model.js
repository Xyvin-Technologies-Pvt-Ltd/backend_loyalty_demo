const mongoose = require("mongoose");

const merchantOfferSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CouponBrand",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CouponCategory",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

