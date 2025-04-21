const express = require("express");
const router = express.Router();
const coinsController = require("./coins.controller");
const { sdkAuth ,sdkUserAuth} = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
// router.use(sdkAuth);
// router.use(sdkUserAuth);

// Create audit middleware for coins
const auditMiddleware = createAuditMiddleware("coins");

// Convert points to coins
router.post("/convert", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("convert_points_to_coins", {
    description: "Convert points to coins",
    targetModel: "Coins",
    details: (req) => req.body,
}), async (req, res) => {
    const response = await coinsController.convertPointsToCoins(req, res);
    req.auditLog.response = response;
});

// Get coin conversion details
router.get("/convert-details", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("get_coin_conversion_details", {
    description: "Get coin conversion details",
    targetModel: "Coins",
    details: (req) => req.body,
}), async (req, res) => {
    const response = await coinsController.getCoinConversionDetails(req, res);
    req.auditLog.response = response;
});

// Get coin transaction history
router.get("/history", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("get_coin_history", {
    description: "Get coin transaction history",
    targetModel: "Coins",
    details: (req) => req.body,
}), async (req, res) => {
    const response = await coinsController.getCoinHistory(req, res);
    req.auditLog.response = response;
});

// Get current coin balance
router.get("/balance", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("get_coin_balance", {
    description: "Get current coin balance",
    targetModel: "Coins",
    details: (req) => req.body,
}), async (req, res) => {
    const response = await coinsController.getCoinBalance(req, res);
    req.auditLog.response = response;
});

module.exports = router; 