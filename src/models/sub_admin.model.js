const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subAdminSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },

    // Role and Access
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },



    // Security
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    accountLocked: {
        type: Boolean,
        default: false
    },
    accountLockedUntil: Date,

    // Activity Tracking
    lastActivity: {
        type: Date,
        default: Date.now
    },
    activityLog: [{
        action: String,
        timestamp: Date,
        details: String
    }]
}, {
    timestamps: true
});

// Hash password before saving
subAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
subAdminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to log activity
subAdminSchema.methods.logActivity = async function (action, details) {
    this.activityLog.push({
        action,
        timestamp: new Date(),
        details
    });
    this.lastActivity = new Date();
    await this.save();
};

// Method to check if account is locked
subAdminSchema.methods.isAccountLocked = function () {
    if (!this.accountLocked) return false;

    if (this.accountLockedUntil && this.accountLockedUntil > new Date()) {
        return true;
    }

    // If lock period has expired, unlock the account
    this.accountLocked = false;
    this.loginAttempts = 0;
    this.save();
    return false;
};

const SubAdmin = mongoose.model('SubAdmin', subAdminSchema);

module.exports = SubAdmin; 