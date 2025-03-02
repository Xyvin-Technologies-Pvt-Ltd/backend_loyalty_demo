/**
 * Example integration of audit logging with authentication
 * 
 * This file demonstrates how to integrate audit logging with authentication routes.
 * It's not meant to be used directly, but as a reference for implementation.
 */

const express = require('express');
const router = express.Router();
const { AuditService } = require('../index');
const { auditAuthentication } = require('../middlewares/audit.middleware');

// Example login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Authenticate user (simplified example)
        const user = await User.findOne({ email });

        if (!user || !await user.comparePassword(password)) {
            // Log failed login attempt
            await AuditService.logAuthentication({
                action: 'login',
                status: 'failure',
                userEmail: email,
                ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                description: 'Failed login attempt: Invalid credentials',
                authMethod: 'password'
            });

            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Log successful login
        await AuditService.logAuthentication({
            action: 'login',
            status: 'success',
            user: user._id,
            userModel: 'User',
            userName: user.name,
            userEmail: user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'User logged in successfully',
            authMethod: 'password'
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'login',
            status: 'failure',
            userEmail: req.body.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error during login',
            errorMessage: error.message,
            stackTrace: error.stack
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example logout controller
const logout = async (req, res) => {
    try {
        // Log logout
        await AuditService.logAuthentication({
            action: 'logout',
            status: 'success',
            user: req.user._id,
            userModel: 'User',
            userName: req.user.name,
            userEmail: req.user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'User logged out successfully',
            authMethod: 'token'
        });

        return res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'logout',
            status: 'failure',
            user: req.user ? req.user._id : null,
            userModel: 'User',
            userName: req.user ? req.user.name : null,
            userEmail: req.user ? req.user.email : null,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error during logout',
            errorMessage: error.message,
            stackTrace: error.stack
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example password reset controller
const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            // Log failed password reset attempt
            await AuditService.logAuthentication({
                action: 'password_reset_request',
                status: 'failure',
                userEmail: email,
                ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                description: 'Failed password reset attempt: User not found',
                authMethod: 'email'
            });

            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate reset token
        const resetToken = generateResetToken(user);

        // Send reset email (simplified)
        await sendResetEmail(user.email, resetToken);

        // Log password reset request
        await AuditService.logAuthentication({
            action: 'password_reset_request',
            status: 'success',
            user: user._id,
            userModel: 'User',
            userName: user.name,
            userEmail: user.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Password reset requested',
            authMethod: 'email'
        });

        return res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        // Log error
        await AuditService.logError({
            action: 'password_reset_request',
            status: 'failure',
            userEmail: req.body.email,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            description: 'Error during password reset request',
            errorMessage: error.message,
            stackTrace: error.stack
        });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Example routes with middleware approach
router.post('/login', auditAuthentication('login', { logRequestBody: false }), login);
router.post('/logout', protect, auditAuthentication('logout'), logout);
router.post('/reset-password', auditAuthentication('password_reset_request', { logRequestBody: false }), resetPassword);

module.exports = router; 