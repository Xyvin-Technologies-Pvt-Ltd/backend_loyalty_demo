/**
 * Example integration of audit logging with user module
 * 
 * This file demonstrates how to integrate audit logging with user routes.
 * It's not meant to be used directly, but as a reference for implementation.
 */

const express = require('express');
const router = express.Router();
const { AuditService } = require('../index');
const { auditUserAction, auditDataModification } = require('../middlewares/audit.middleware');
const { protect } = require('../../../middlewares/protect');
const { isAuthenticated } = require('../../../middlewares/auth');

// Example profile update controller
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;

        // Get original user data for audit
        const originalUser = await User.findById(userId);

        if (!originalUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Log user action
        await AuditService.logUserAction({
            action: 'update_profile',
            user: userId,
            userModel: 'User',
            userName: updatedUser.name,
            userEmail: updatedUser.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: userId,
            targetModel: 'User',
            description: 'User updated their profile',
            details: { fields: Object.keys(updateData) },
            before: {
                name: originalUser.name,
                email: originalUser.email,
                phone: originalUser.phone
            },
            after: {
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'update_profile',
            status: 'failure',
            user: req.user._id,
            userModel: 'User',
            userName: req.user.name,
            userEmail: req.user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error updating user profile',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example password change controller
const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        // Get user
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if current password matches
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            // Log failed password change attempt
            await AuditService.logSecurityEvent({
                action: 'change_password',
                status: 'failure',
                user: userId,
                userModel: 'User',
                userName: user.name,
                userEmail: user.email,
                ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                description: 'Failed password change attempt - incorrect current password',
                details: { reason: 'incorrect_current_password' }
            });

            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Log successful password change
        await AuditService.logSecurityEvent({
            action: 'change_password',
            status: 'success',
            user: userId,
            userModel: 'User',
            userName: user.name,
            userEmail: user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'User successfully changed password',
            details: { passwordLastChangedAt: new Date() }
        });

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'change_password',
            status: 'failure',
            user: req.user._id,
            userModel: 'User',
            userName: req.user.name,
            userEmail: req.user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error changing password',
            errorMessage: error.message,
            stackTrace: error.stack
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example notification preferences controller
const updateNotificationPreferences = async (req, res) => {
    try {
        const userId = req.user._id;
        const { preferences } = req.body;

        // Get original preferences
        const user = await User.findById(userId);
        const originalPreferences = user.notificationPreferences || {};

        // Update preferences
        user.notificationPreferences = {
            ...originalPreferences,
            ...preferences
        };

        await user.save();

        // Log user action
        await AuditService.logUserAction({
            action: 'update_notification_preferences',
            user: userId,
            userModel: 'User',
            userName: user.name,
            userEmail: user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'User updated notification preferences',
            before: originalPreferences,
            after: user.notificationPreferences
        });

        return res.status(200).json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: {
                notificationPreferences: user.notificationPreferences
            }
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'update_notification_preferences',
            status: 'failure',
            user: req.user._id,
            userModel: 'User',
            userName: req.user.name,
            userEmail: req.user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error updating notification preferences',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example routes with middleware approach
router.put(
    '/profile',
    protect,
    isAuthenticated,
    auditUserAction('update_profile', {
        description: 'User updated their profile',
        getOriginalData: async (req) => {
            const user = await User.findById(req.user._id);
            return user ? {
                name: user.name,
                email: user.email,
                phone: user.phone
            } : null;
        }
    }),
    updateProfile
);

router.post(
    '/change-password',
    protect,
    isAuthenticated,
    auditUserAction('change_password', {
        description: 'User changed their password',
        securityEvent: true
    }),
    changePassword
);

router.put(
    '/notification-preferences',
    protect,
    isAuthenticated,
    auditDataModification({
        action: 'update_notification_preferences',
        targetModel: 'User',
        description: 'User updated notification preferences',
        getOriginalData: async (req) => {
            const user = await User.findById(req.user._id);
            return user ? user.notificationPreferences || {} : {};
        }
    }),
    updateNotificationPreferences
);

module.exports = router; 