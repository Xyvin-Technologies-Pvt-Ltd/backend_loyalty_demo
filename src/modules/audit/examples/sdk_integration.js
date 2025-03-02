/**
 * Example integration of audit logging with SDK API
 * 
 * This file demonstrates how to integrate audit logging with SDK API routes.
 * It's not meant to be used directly, but as a reference for implementation.
 */

const express = require('express');
const router = express.Router();
const { AuditService } = require('../index');
const { auditSDKAction } = require('../middlewares/audit.middleware');
const { validateSDKAccessKey } = require('../../../middlewares/sdk_auth');

// Example point issuance controller
const issuePoints = async (req, res) => {
    try {
        const { user_id, points, transaction_reference, reason } = req.body;

        // Get user
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get original points
        const originalPoints = user.points || 0;

        // Create transaction
        const transaction = await Transaction.create({
            user: user_id,
            points,
            type: 'CREDIT',
            reference: transaction_reference,
            reason,
            issuedBy: req.client._id,
            issuedByModel: 'SDKClient'
        });

        // Update user points
        user.points = originalPoints + points;
        await user.save();

        // Log SDK action
        await AuditService.logSDKAction({
            action: 'issue_points',
            client: req.client._id,
            clientName: req.client.name,
            clientKey: req.client.key_identifier,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: user_id,
            targetModel: 'User',
            targetName: user.name,
            description: `SDK client issued ${points} points to user`,
            details: {
                points,
                transaction_reference,
                reason,
                transaction_id: transaction._id
            },
            before: { points: originalPoints },
            after: { points: user.points }
        });

        return res.status(200).json({
            success: true,
            message: 'Points issued successfully',
            data: {
                transaction_id: transaction._id,
                user_id,
                points_issued: points,
                current_points: user.points
            }
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'issue_points',
            status: 'failure',
            client: req.client ? req.client._id : null,
            clientName: req.client ? req.client.name : 'Unknown',
            clientKey: req.client ? req.client.key_identifier : 'Unknown',
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: req.body.user_id,
            targetModel: 'User',
            description: 'Error issuing points',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example point redemption controller
const redeemPoints = async (req, res) => {
    try {
        const { user_id, points, transaction_reference, reason } = req.body;

        // Get user
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get original points
        const originalPoints = user.points || 0;

        // Check if user has enough points
        if (originalPoints < points) {
            // Log failed redemption
            await AuditService.logSDKAction({
                action: 'redeem_points',
                status: 'failure',
                client: req.client._id,
                clientName: req.client.name,
                clientKey: req.client.key_identifier,
                ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                targetId: user_id,
                targetModel: 'User',
                targetName: user.name,
                description: `SDK client attempted to redeem ${points} points but user has insufficient balance`,
                details: {
                    points_requested: points,
                    available_points: originalPoints,
                    transaction_reference,
                    reason
                }
            });

            return res.status(400).json({
                success: false,
                message: 'Insufficient points',
                data: {
                    available_points: originalPoints,
                    requested_points: points
                }
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            user: user_id,
            points: -points,
            type: 'DEBIT',
            reference: transaction_reference,
            reason,
            issuedBy: req.client._id,
            issuedByModel: 'SDKClient'
        });

        // Update user points
        user.points = originalPoints - points;
        await user.save();

        // Log SDK action
        await AuditService.logSDKAction({
            action: 'redeem_points',
            status: 'success',
            client: req.client._id,
            clientName: req.client.name,
            clientKey: req.client.key_identifier,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: user_id,
            targetModel: 'User',
            targetName: user.name,
            description: `SDK client redeemed ${points} points from user`,
            details: {
                points,
                transaction_reference,
                reason,
                transaction_id: transaction._id
            },
            before: { points: originalPoints },
            after: { points: user.points }
        });

        return res.status(200).json({
            success: true,
            message: 'Points redeemed successfully',
            data: {
                transaction_id: transaction._id,
                user_id,
                points_redeemed: points,
                current_points: user.points
            }
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'redeem_points',
            status: 'failure',
            client: req.client ? req.client._id : null,
            clientName: req.client ? req.client.name : 'Unknown',
            clientKey: req.client ? req.client.key_identifier : 'Unknown',
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: req.body.user_id,
            targetModel: 'User',
            description: 'Error redeeming points',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example user lookup controller
const getUserInfo = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Get user
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Log SDK action
        await AuditService.logSDKAction({
            action: 'get_user_info',
            client: req.client._id,
            clientName: req.client.name,
            clientKey: req.client.key_identifier,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: user_id,
            targetModel: 'User',
            targetName: user.name,
            description: 'SDK client retrieved user information'
        });

        return res.status(200).json({
            success: true,
            data: {
                user_id: user._id,
                name: user.name,
                email: user.email,
                points: user.points,
                tier: user.tier,
                joined_at: user.createdAt
            }
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'get_user_info',
            status: 'failure',
            client: req.client ? req.client._id : null,
            clientName: req.client ? req.client.name : 'Unknown',
            clientKey: req.client ? req.client.key_identifier : 'Unknown',
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            targetId: req.params.user_id,
            targetModel: 'User',
            description: 'Error retrieving user information',
            errorMessage: error.message,
            stackTrace: error.stack
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example routes with middleware approach
router.post(
    '/points/issue',
    validateSDKAccessKey('MANAGE_POINTS'),
    auditSDKAction('issue_points', {
        description: 'SDK client issued points to user',
        targetModel: 'User',
        targetId: req => req.body.user_id,
        getOriginalData: async (req) => {
            const user = await User.findById(req.body.user_id);
            return user ? { points: user.points || 0 } : null;
        }
    }),
    issuePoints
);

router.post(
    '/points/redeem',
    validateSDKAccessKey('MANAGE_POINTS'),
    auditSDKAction('redeem_points', {
        description: 'SDK client redeemed points from user',
        targetModel: 'User',
        targetId: req => req.body.user_id,
        getOriginalData: async (req) => {
            const user = await User.findById(req.body.user_id);
            return user ? { points: user.points || 0 } : null;
        }
    }),
    redeemPoints
);

router.get(
    '/users/:user_id',
    validateSDKAccessKey('READ_USERS'),
    auditSDKAction('get_user_info', {
        description: 'SDK client retrieved user information',
        targetModel: 'User',
        targetId: req => req.params.user_id
    }),
    getUserInfo
);

module.exports = router; 