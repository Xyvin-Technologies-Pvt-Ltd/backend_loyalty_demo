const express = require("express");
const router = express.Router();
const loyaltyPointsController = require("./loyalty_points.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
router.use(sdkAuth([]));
router.use(sdkUserAuth);

// Create audit middleware for loyalty points
const auditMiddleware = createAuditMiddleware("loyalty_points");

// Get points history with pagination and filters
router.get("/history", auditMiddleware.captureResponse(), auditMiddleware.sdkAction("get_my_points_history", {
    description: "Get points history with pagination and filters",
    targetModel: "LoyaltyPoints",
    details: (req) => req.query,
}),  loyaltyPointsController.getMyPointsHistory );

// Get points summary with date range filtering
router.get("/summary", auditMiddleware.captureResponse(), auditMiddleware.sdkAction("get_points_summary", {
    description: "Get points summary with date range filtering",
    targetModel: "LoyaltyPoints",
    details: (req) => req.query,
}), loyaltyPointsController.getPointsSummary );

// Get specific points details
router.get("/:points_id", auditMiddleware.captureResponse(), auditMiddleware.sdkAction("get_points_details", {
    description: "Get specific points details",
    targetModel: "LoyaltyPoints",
    details: (req) => req.params,
}), loyaltyPointsController.getPointsDetails );


module.exports = router; 