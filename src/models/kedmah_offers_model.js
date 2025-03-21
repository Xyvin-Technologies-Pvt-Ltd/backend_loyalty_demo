const mongoose = require("mongoose");

// Kedmah In-house Offers Schema
const kedmahOffersSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        appType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AppType",
            required: true,
        },
        tier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tier",
            required: true,
        },
        offerType: {
            type: String,
            enum: ["DISCOUNT", "FLAT_OFFER"],
            required: true,
        },
        posterImage: {
            type: String,
            required: true,
        },
        serviceCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TriggerServices",
            required: true,
        },

        eventType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TriggerEvent",
            default: null,
        },
        discountDetails: {
            type: {
                type: String,
                enum: ["PERCENTAGE", "FIXED"],
                required: function () {
                    return this.offerType === "DISCOUNT";
                }
            },
            value: {
                type: Number,
                required: function () {
                    return this.offerType === "DISCOUNT";
                }
            }
        },

        validityPeriod: {
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true,
            }
        },
        usagePolicy: {
            maxUsagePerUser: {
                type: Number,
                required: true,
            },
            frequency: {
                type: String,
                enum: ["DAILY", "WEEKLY", "MONTHLY", "TOTAL"],
                required: true,
            },
            userLimit: {
                type: Number,
                default: null // null means unlimited users
            }
        },
        eligibilityCriteria: {
            userTypes: [{
                type: String,
                enum: ["NEW", "EXISTING", "PREMIUM", "ALL"],
            }],
            minTransactionHistory: {
                type: Number,
                default: 0
            },
            tierTypes: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tier",
                    required: true,
                }
            ]
        },
        redeemablePointsCount: {
            type: Number,
            default: 0
        },
        conditions: {
            minTransactionValue: {
                type: Number,
                default: 0
            },
            maxTransactionValue: {
                type: Number,
                default: null
            },
            applicablePaymentMethods: [{
                type: String,
                enum: ["Khedmah-site", "KhedmahPay-Wallet", "ALL"],
                default: "ALL"
            }]
        },
        termsAndConditions: [{
            type: String
        }],
        redemptionInstructions: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageHistory: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            usedAt: {
                type: Date,
                default: Date.now
            },
            transactionId: {
                type: String,
                default: null
            }
        }]
    },
    { timestamps: true }
);

// Add index for faster queries
kedmahOffersSchema.index({ 'validityPeriod.startDate': 1, 'validityPeriod.endDate': 1 });
kedmahOffersSchema.index({ offerType: 1, isActive: 1 });
kedmahOffersSchema.index({ serviceCategory: 1 });

const KedmahOffers = mongoose.model("KedmahOffers", kedmahOffersSchema);

module.exports = KedmahOffers; 