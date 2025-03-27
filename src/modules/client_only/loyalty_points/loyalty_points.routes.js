const express = require("express");
const router = express.Router();
const loyaltyPointsController = require("./loyalty_points.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth");
const { createAuditMiddleware } = require("../../../middlewares/audit");

// Apply SDK authentication middleware
router.use(sdkAuth);
router.use(sdkUserAuth);

// Create audit middleware for loyalty points
const auditMiddleware = createAuditMiddleware("loyalty_points");

// Get points history with pagination and filters
router.get("/history", auditMiddleware, async (req, res) => {
    const response = await loyaltyPointsController.getMyPointsHistory(req, res);
    req.auditLog.response = response;
});

// Get points summary with date range filtering
router.get("/summary", auditMiddleware, async (req, res) => {
    const response = await loyaltyPointsController.getPointsSummary(req, res);
    req.auditLog.response = response;
});

// Get specific points details
router.get("/:points_id", auditMiddleware, async (req, res) => {
    const response = await loyaltyPointsController.getPointsDetails(req, res);
    req.auditLog.response = response;
});

module.exports = router; 