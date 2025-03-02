const express = require("express");
const router = express.Router();
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/sdk_auth");
const sdkApiController = require("../controllers/sdk_api.controller");
const { createAuditMiddleware } = require("../../audit");

// Create audit middleware for the sdk module
const sdkAudit = createAuditMiddleware("sdk");

/**
 * @route   GET /api/sdk/users/:user_id/points
 * @desc    Get user points balance
 * @access  Private (SDK)
 */
router.get(
    "/users/:user_id/points",
    sdkAuth(["read_user_points"]),
    sdkAudit.sdkAction("get_user_points", {
        description: "SDK accessed user points balance",
        targetModel: "User",
        targetId: req => req.params.user_id,
        details: req => ({
            sdkKey: req.sdkKey?.id || 'unknown',
            permissions: req.sdkKey?.permissions || []
        })
    }),
    sdkApiController.getUserPoints
);

/**
 * @route   GET /api/sdk/users/:user_id/transactions
 * @desc    Get user transactions
 * @access  Private (SDK)
 */
router.get(
    "/users/:user_id/transactions",
    sdkAuth(["read_user_transactions"]),
    sdkAudit.sdkAction("get_user_transactions", {
        description: "SDK accessed user transactions",
        targetModel: "User",
        targetId: req => req.params.user_id,
        details: req => ({
            sdkKey: req.sdkKey?.id || 'unknown',
            permissions: req.sdkKey?.permissions || [],
            query: req.query
        })
    }),
    sdkApiController.getUserTransactions
);

/**
 * @route   POST /api/sdk/transactions
 * @desc    Record a transaction (earn points)
 * @access  Private (SDK)
 */
router.post(
    "/transactions",
    sdkAuth(["create_transactions"]),
    sdkAudit.captureResponse(),
    sdkAudit.sdkAction("record_transaction", {
        description: "SDK recorded a transaction",
        targetModel: "Transaction",
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    sdkApiController.recordTransaction
);

/**
 * @route   POST /api/sdk/redemptions
 * @desc    Redeem points
 * @access  Private (SDK)
 */
router.post(
    "/redemptions",
    sdkAuth(["create_redemptions"]),
    sdkAudit.captureResponse(),
    sdkAudit.sdkAction("redeem_points", {
        description: "SDK redeemed points",
        targetModel: "Redemption",
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    sdkApiController.redeemPoints
);

/**
 * @route   GET /api/sdk/user/profile
 * @desc    Get user profile with token
 * @access  Private (SDK + User Token)
 */
router.get(
    "/user/profile",
    sdkAuth(["read_user_profile"]),
    sdkUserAuth,
    sdkAudit.sdkAction("get_user_profile", {
        description: "SDK accessed user profile",
        targetModel: "User",
        targetId: req => req.user?.id,
        details: req => ({
            sdkKey: req.sdkKey?.id || 'unknown',
            permissions: req.sdkKey?.permissions || []
        })
    }),
    sdkApiController.getUserProfile
);

module.exports = router; 