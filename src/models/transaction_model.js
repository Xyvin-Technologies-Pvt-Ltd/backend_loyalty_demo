const mongoose = require("mongoose");

const transaction_schema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
  
    transaction_type: {
      type: String,
      trim: true,
      enum: ["earn", "redeem", "expire","adjust","other"],
      required: true
    },
    source: { type: String, enum:["purchase","referral","manual_adjustment","auto_expire","other"],default:"other"},

    points: { type: Number, trim: true, required: true },

    transaction_id: { type: String, unique: true,required:true },

    purchased_item:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"PointsCriteria",
      default:null
    }, // if used for coupons

    redeemed_item:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Offer",
      default:null
    }, // if used for coupons

    app_type: { type: mongoose.Schema.Types.ObjectId, ref:"AppType", trim: true },

    status: {
      type: String,
      trim: true,
      enum: ["pending", "completed", "rejected", "cancelled", "failed", "expired"],
      default: "pending",
    },
    note: { type: Object, trim: true },
    provider: { type: String, trim: true },
    app: {
      type: String,
      trim: true,
      enum: ["Khedmah Delivery", "Khedmah Payment"],
    },
    // Additional fields for redemption transactions
    transaction_date: {
      type: Date,
      default: Date.now
    },
    transaction_reference: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined values to not trigger uniqueness constraint
    },
    reward_type: {
      type: String,
      trim: true
    },
    reward_details: {
      type: mongoose.Schema.Types.Mixed
    },
    
   
  },
  { timestamps: true }
);

// Index for faster queries by user and date
transaction_schema.index({ user: 1, transaction_date: 1 });
transaction_schema.index({ user: 1, type: 1 });



const Transaction = mongoose.model("Transaction", transaction_schema);

module.exports = Transaction;
