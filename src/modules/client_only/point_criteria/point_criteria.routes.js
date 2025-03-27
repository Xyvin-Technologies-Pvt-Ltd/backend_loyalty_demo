const express = require("express");
const router = express.Router();
const pointCriteriaController = require("./point_criteria.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth");
const { createAuditMiddleware } = require("../../../middlewares/audit");

// Apply SDK authentication middleware
router.use(sdkAuth);
router.use(sdkUserAuth);

// Create audit middleware for point criteria
const auditMiddleware = createAuditMiddleware("point_criteria");

// Process loyalty event and calculate points
router.post("/process", auditMiddleware, async (req, res) => {
    const response = await pointCriteriaController.calculatePoints(req, res);
    req.auditLog.response = response;
});

// Check customer eligibility based on usage history
router.get("/check-eligibility", auditMiddleware, async (req, res) => {
    const response = await pointCriteriaController.checkCustomerEligibility(req, res);
    req.auditLog.response = response;
});

// Get point calculation details without processing
router.get("/calculate-details", auditMiddleware, async (req, res) => {
    const response = await pointCriteriaController.getPointCalculationDetails(req, res);
    req.auditLog.response = response;
});

// Get supported payment methods
router.get("/payment-methods", auditMiddleware, async (req, res) => {
    const response = await pointCriteriaController.getSupportedPaymentMethods(req, res);
    req.auditLog.response = response;
});

module.exports = router; 