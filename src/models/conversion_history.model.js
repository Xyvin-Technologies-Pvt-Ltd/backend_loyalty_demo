const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversionHistorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        points: {
            type: Number,
            required: true,
            min: 1
        },
        coins: {
            type: Number,
            required: true,
            min: 1
        },
        bonus: {
            type: Number,
            default: 0,
            min: 0
        },
        conversionRate: {
            type: String,
            required: true,
            description: 'Rate at which points were converted (e.g., "1:10")'
        },
        conversionRule: {
            type: Schema.Types.ObjectId,
            ref: 'ConversionRule'
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'cancelled'],
            default: 'completed'
        },
        transactionId: {
            type: String,
            unique: true,
            sparse: true
        },
        notes: {
            type: String
        },
        processedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin'
        },
        processedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Virtual for total coins (base + bonus)
conversionHistorySchema.virtual('totalCoins').get(function () {
    return this.coins + (this.bonus || 0);
});

// Index for faster queries
conversionHistorySchema.index({ user: 1, createdAt: -1 });
conversionHistorySchema.index({ status: 1 });

const ConversionHistory = mongoose.model('ConversionHistory', conversionHistorySchema);

module.exports = ConversionHistory; 