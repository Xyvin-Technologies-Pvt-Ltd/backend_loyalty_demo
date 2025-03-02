/**
 * Example integration of audit logging with transaction module
 * 
 * This file demonstrates how to integrate audit logging with transaction routes.
 * It's not meant to be used directly, but as a reference for implementation.
 */

const express = require('express');
const router = express.Router();
const { AuditService } = require('../index');
const { auditDataModification } = require('../middlewares/audit.middleware');
const { protect } = require('../../../middlewares/protect');

// Example transaction creation controller
const createTransaction = async (req, res) => {
    try {
        const { user_id, amount, points, type, merchant, note } = req.body;

        // Create transaction (simplified example)
        const transaction = new Transaction({
            user: user_id,
            amount,
            points,
            type,
            merchant,
            note,
            status: 'completed'
        });

        await transaction.save();

        // Update user points if earning or referral
        if (type === 'earning' || type === 'referral') {
            const user = await User.findById(user_id);
            user.points += points;
            await user.save();
        }

        // Log point transaction
        await AuditService.logPointTransaction({
            action: `create_${type}_transaction`,
            user: user_id,
            userModel: 'User',
            targetId: transaction._id,
            targetModel: 'Transaction',
            description: `Created ${type} transaction for ${points} points`,
            points,
            transactionType: type,
            details: {
                amount,
                merchant,
                note
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'create_transaction',
            status: 'failure',
            user: req.body.user_id,
            userModel: 'User',
            description: 'Error creating transaction',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example redemption controller
const redeemPoints = async (req, res) => {
    try {
        const { user_id, points, reward_type, reward_details } = req.body;

        // Check if user has enough points
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.points < points) {
            // Log failed redemption attempt
            await AuditService.logPointTransaction({
                action: 'redeem_points',
                status: 'failure',
                user: user_id,
                userModel: 'User',
                userName: user.name,
                userEmail: user.email,
                description: 'Failed redemption attempt: Insufficient points',
                points,
                transactionType: 'redemption',
                details: {
                    reward_type,
                    reward_details,
                    available_points: user.points
                }
            });

            return res.status(400).json({
                success: false,
                message: 'Insufficient points',
                data: {
                    available_points: user.points,
                    requested_points: points
                }
            });
        }

        // Create redemption transaction
        const transaction = new Transaction({
            user: user_id,
            points,
            type: 'redemption',
            status: 'completed',
            reward_type,
            reward_details,
            transaction_reference: `RED-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });

        await transaction.save();

        // Update user points
        const originalPoints = user.points;
        user.points -= points;
        await user.save();

        // Log redemption
        await AuditService.logPointTransaction({
            action: 'redeem_points',
            user: user_id,
            userModel: 'User',
            userName: user.name,
            userEmail: user.email,
            targetId: transaction._id,
            targetModel: 'Transaction',
            description: `Redeemed ${points} points for ${reward_type}`,
            points,
            transactionType: 'redemption',
            details: {
                reward_type,
                reward_details,
                before_points: originalPoints,
                after_points: user.points
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Points redeemed successfully',
            data: {
                transaction,
                remaining_points: user.points
            }
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'redeem_points',
            status: 'failure',
            user: req.body.user_id,
            userModel: 'User',
            description: 'Error redeeming points',
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example routes with middleware approach
router.post(
    '/transactions',
    protect,
    auditDataModification('create_transaction', {
        targetModel: 'Transaction',
        description: 'Create new transaction'
    }),
    createTransaction
);

router.post(
    '/redemptions',
    protect,
    auditDataModification('redeem_points', {
        targetModel: 'Transaction',
        description: 'Redeem points for reward',
        getOriginalData: async (req) => {
            const user = await User.findById(req.body.user_id);
            return { points: user ? user.points : 0 };
        },
        getModifiedData: async (req, res) => {
            const user = await User.findById(req.body.user_id);
            return { points: user ? user.points : 0 };
        }
    }),
    redeemPoints
);

module.exports = router; 