/**
 * Example integration of audit logging with admin module
 * 
 * This file demonstrates how to integrate audit logging with admin routes.
 * It's not meant to be used directly, but as a reference for implementation.
 */

const express = require('express');
const router = express.Router();
const { AuditService } = require('../index');
const { auditAdminAction } = require('../middlewares/audit.middleware');
const { protect } = require('../../../middlewares/protect');
const { authorize } = require('../../../middlewares/auth');

// Example user management controller
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
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

        // Log admin action
        await AuditService.logAdminAction({
            action: 'update_user',
            user: req.admin._id,
            userModel: 'Admin',
            userName: req.admin.name,
            userEmail: req.admin.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: userId,
            targetModel: 'User',
            targetName: updatedUser.name,
            description: 'Admin updated user profile',
            details: { fields: Object.keys(updateData) },
            before: {
                name: originalUser.name,
                email: originalUser.email,
                points: originalUser.points,
                tier: originalUser.tier
            },
            after: {
                name: updatedUser.name,
                email: updatedUser.email,
                points: updatedUser.points,
                tier: updatedUser.tier
            }
        });

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'update_user',
            status: 'failure',
            user: req.admin._id,
            userModel: 'Admin',
            userName: req.admin.name,
            userEmail: req.admin.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: req.params.id,
            targetModel: 'User',
            description: 'Error updating user',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example system settings controller
const updateSystemSettings = async (req, res) => {
    try {
        const { setting_key, setting_value } = req.body;

        // Get original setting
        const originalSetting = await SystemSetting.findOne({ key: setting_key });

        if (!originalSetting) {
            return res.status(404).json({ success: false, message: 'Setting not found' });
        }

        // Update setting
        const updatedSetting = await SystemSetting.findOneAndUpdate(
            { key: setting_key },
            { $set: { value: setting_value } },
            { new: true }
        );

        // Log admin action
        await AuditService.logAdminAction({
            action: 'update_system_setting',
            user: req.admin._id,
            userModel: 'Admin',
            userName: req.admin.name,
            userEmail: req.admin.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: updatedSetting._id,
            targetModel: 'SystemSetting',
            targetName: setting_key,
            description: `Admin updated system setting: ${setting_key}`,
            before: { value: originalSetting.value },
            after: { value: setting_value }
        });

        return res.status(200).json({
            success: true,
            message: 'System setting updated successfully',
            data: updatedSetting
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'update_system_setting',
            status: 'failure',
            user: req.admin._id,
            userModel: 'Admin',
            userName: req.admin.name,
            userEmail: req.admin.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error updating system setting',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example role management controller
const assignUserRole = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        // Get user and role
        const user = await User.findById(userId);
        const role = await Role.findById(roleId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        // Get original roles
        const originalRoles = [...user.roles];

        // Update user roles
        user.roles = user.roles || [];
        if (!user.roles.includes(roleId)) {
            user.roles.push(roleId);
        }

        await user.save();

        // Log admin action
        await AuditService.logAdminAction({
            action: 'assign_user_role',
            user: req.admin._id,
            userModel: 'Admin',
            userName: req.admin.name,
            userEmail: req.admin.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: userId,
            targetModel: 'User',
            targetName: user.name,
            description: `Admin assigned role ${role.name} to user ${user.name}`,
            before: { roles: originalRoles },
            after: { roles: user.roles }
        });

        return res.status(200).json({
            success: true,
            message: 'Role assigned successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles
                },
                role: {
                    _id: role._id,
                    name: role.name
                }
            }
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'assign_user_role',
            status: 'failure',
            user: req.admin._id,
            userModel: 'Admin',
            userName: req.admin.name,
            userEmail: req.admin.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error assigning user role',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example routes with middleware approach
router.put(
    '/users/:id',
    protect,
    authorize('MANAGE_USERS'),
    auditAdminAction('update_user', {
        targetModel: 'User',
        targetId: req => req.params.id,
        description: 'Admin updated user profile',
        getOriginalData: async (req) => {
            const user = await User.findById(req.params.id);
            return user ? {
                name: user.name,
                email: user.email,
                points: user.points,
                tier: user.tier
            } : null;
        }
    }),
    updateUser
);

router.put(
    '/settings',
    protect,
    authorize('MANAGE_SETTINGS'),
    auditAdminAction('update_system_setting', {
        targetModel: 'SystemSetting',
        targetId: req => req.body.setting_id,
        targetName: req => req.body.setting_key,
        description: 'Admin updated system setting'
    }),
    updateSystemSettings
);

router.post(
    '/users/roles',
    protect,
    authorize('MANAGE_ROLES'),
    auditAdminAction('assign_user_role', {
        targetModel: 'User',
        targetId: req => req.body.userId,
        description: 'Admin assigned role to user'
    }),
    assignUserRole
);

module.exports = router; 