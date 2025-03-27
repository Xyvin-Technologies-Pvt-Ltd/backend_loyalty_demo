const express = require("express");
const router = express.Router();
const coinsController = require("./coins.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth");
const { createAuditMiddleware } = require("../../../middlewares/audit");

// Apply SDK authentication middleware
router.use(sdkAuth);
router.use(sdkUserAuth);

// Create audit middleware for coins
const auditMiddleware = createAuditMiddleware("coins");

// Convert points to coins
router.post("/convert", auditMiddleware, async (req, res) => {
    const response = await coinsController.convertPointsToCoins(req, res);
    req.auditLog.response = response;
});

// Get coin conversion details
router.get("/convert-details", auditMiddleware, async (req, res) => {
    const response = await coinsController.getCoinConversionDetails(req, res);
    req.auditLog.response = response;
});

// Get coin transaction history
router.get("/history", auditMiddleware, async (req, res) => {
    const response = await coinsController.getCoinHistory(req, res);
    req.auditLog.response = response;
});

// Get current coin balance
router.get("/balance", auditMiddleware, async (req, res) => {
    const response = await coinsController.getCoinBalance(req, res);
    req.auditLog.response = response;
});

module.exports = router; 