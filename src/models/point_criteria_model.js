const mongoose = require('mongoose');

// Points Criteria Schema
const pointsCriteriaSchema = new mongoose.Schema({
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TriggerEvent', 
    required: true 
  },

  serviceName: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TriggerServices', 
    required: true 
  },

  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppType',
    required: true
  },

  pointSystem: [
    {
      type: {
        type: String,
        enum: ['Khedmah-site', 'KhedmahPay-Wallet'], // Separate logic for Khedmah & KhedmahPay
        required: true
      },
      pointType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
      },
 
      conditions: {
  
        maxTransactions: {
          weekly: { type: Number, default: null },
          monthly: { type: Number, default: null }
        },
        transactionValueLimits: [
          {
            minValue: { type: Number, default: 0 },
            maxValue: { type: Number, default: null },
            pointRate: { type: Number, required: true }
          }
        ]
      }
    }
  ],

  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PointsCriteria = mongoose.model('PointsCriteria', pointsCriteriaSchema);

module.exports = PointsCriteria;
