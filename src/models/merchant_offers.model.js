const mongoose = require('mongoose');

const couponCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CouponBrand',
        required: true
    },
    appType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppType',
        required: true
    },
   
    type: {
        type: String,
        enum: ['PRE_GENERATED', 'DYNAMIC', 'ONE_TIME_LINK'],
        required: true
    },
    // New fields for image and description
    posterImage: {
        type: String,  // URL to the image
        required: true
    },
    description: {
        type: String,
        required: true
    },
    //eligibility criteria
    eligibilityCriteria: {
        userTypes: [{
            type: String,
            enum: ['NEW', 'EXISTING', 'PREMIUM', 'ALL'],
        }],
        tierTypes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tier',
            required: true
        }],
        
    },
    
    // Usage conditions
    usageLimit: {
        type: {
            frequency: {
                type: String,
                enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'],
                required: true
            },
            maxUsagePerPeriod: {
                type: Number,
                required: true
            },
            maxTotalUsage: {
                type: Number,  // Maximum total times this coupon can be used across all users
                
            }
        },
        required: true
    },
    
    // Terms and conditions
    termsAndConditions: [{
        type: String
    }],
    
    // Minimum purchase requirements
    minimumPurchaseAmount: {
        type: Number,
        default: 0
    },
    
    // Usage tracking
    usageHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['UNUSED', 'CLAIMED', 'REDEEMED', 'EXPIRED'],
        default: 'UNUSED'
    },
    couponCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CouponCategory',
        default: null
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    },
    startDate: {
        type: Date,
        required: true
    },
    redeemablePointsCount: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED'],
        required: true
    },
    redemptionUrl: String
   
}, { timestamps: true });




// Helper method to check if a user can use the coupon
couponCodeSchema.methods.canUserUseCoupon = async function(userId) {
    const now = new Date();
    const userUsageHistory = this.usageHistory.filter(usage => 
        usage.userId.toString() === userId.toString()
    );

    if (userUsageHistory.length >= this.usageLimit.maxTotalUsage) {
        return {
            canUse: false,
            reason: 'Maximum total usage limit reached'
        };
    }

    let relevantDate;
    switch (this.usageLimit.frequency) {
        case 'DAILY':
            relevantDate = new Date(now.setHours(0,0,0,0));
            break;
        case 'WEEKLY':
            relevantDate = new Date(now.setDate(now.getDate() - now.getDay()));
            break;
        case 'BIWEEKLY':
            relevantDate = new Date(now.setDate(now.getDate() - 14));
            break;
        case 'MONTHLY':
            relevantDate = new Date(now.setDate(1));
            break;
    }

    const usageInPeriod = userUsageHistory.filter(usage => 
        usage.usedAt >= relevantDate
    ).length;

    if (usageInPeriod >= this.usageLimit.maxUsagePerPeriod) {
        return {
            canUse: false,
            reason: `Usage limit for this ${this.usageLimit.frequency.toLowerCase()} period reached`
        };
    }

    return {
        canUse: true
    };
};

// Index for faster queries
couponCodeSchema.index({ code: 1 });
couponCodeSchema.index({ merchantId: 1, status: 1 });

module.exports = mongoose.model('CouponCode', couponCodeSchema); 