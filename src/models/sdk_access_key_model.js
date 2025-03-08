const mongoose = require("mongoose");
const crypto = require("crypto");

const sdk_access_key_schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
       
        key: {
            type: String,
            required: true,
            unique: true
        },
        permissions: {
            user_data: { type: Boolean, default: true },
            transactions: { type: Boolean, default: true },
            points: { type: Boolean, default: true },
            redemptions: { type: Boolean, default: true },  

        },
        // rate_limit: {
        //     requests_per_minute: { type: Number, default: 60 },
        //     requests_per_day: { type: Number, default: 10000 }
        // },
        status: {
            type: String,
            enum: ['active', 'inactive', 'revoked'],
            default: 'active'
        },
        environment: {
            type: String,
            enum: ['development', 'production'],
            default: 'production'
        },
        last_used: {
            type: Date
        },
        usage_stats: {
            total_requests: { type: Number, default: 0 },
            last_24h_requests: { type: Number, default: 0 }
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        }
    },
    { timestamps: true }
);

// Static method to generate a new access key
sdk_access_key_schema.statics.generateKey = function () {
    return crypto.randomBytes(32).toString('hex');
};

// Method to update usage statistics
sdk_access_key_schema.methods.updateUsage = async function () {
    this.last_used = new Date();
    this.usage_stats.total_requests += 1;
    this.usage_stats.last_24h_requests += 1;

    // Reset the 24h counter if needed (in a real app, you'd use a scheduled job for this)
    return this.save();
};

// Method to check if key is valid and active
sdk_access_key_schema.methods.isValid = function () {
    return this.status === 'active';
};

// Method to check if key has specific permission
sdk_access_key_schema.methods.hasPermission = function (permission) {
    return this.permissions[permission] === true;
};

const SDKAccessKey = mongoose.model("SDKAccessKey", sdk_access_key_schema);

module.exports = SDKAccessKey; 