const express = require("express");
const router = express.Router();
const pointCriteriaController = require("./point_criteria.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
router.use(sdkAuth([]));
router.use(sdkUserAuth);

// Create audit middleware for point criteria
const auditMiddleware = createAuditMiddleware("point_criteria");

// Process loyalty event and calculate points
router.post("/process", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("process_loyalty_event", {
    description: "Process loyalty event and calculate points",
    targetModel: "PointCriteria",
    details: (req) => req.body,
}), pointCriteriaController.process_loyalty_event );


// Check customer eligibility based on usage history
router.get("/check-eligibility", auditMiddleware.captureResponse(), auditMiddleware.sdkAction("check_customer_eligibility", {
    description: "Check customer eligibility based on usage history",
    targetModel: "PointCriteria",
    details: (req) => req.body,
}), pointCriteriaController.checkCustomerEligibility );


// Get point calculation details without processing
router.get("/calculate-details", auditMiddleware.captureResponse(), auditMiddleware.sdkAction("get_point_calculation_details", {
    description: "Get point calculation details without processing",
    targetModel: "PointCriteria",
    details: (req) => req.body,
}), pointCriteriaController.getPointCalculationDetails );

// Get supported payment methods
router.get("/payment-methods", auditMiddleware.captureResponse(), auditMiddleware.sdkAction("get_supported_payment_methods", {
    description: "Get supported payment methods",
    targetModel: "PointCriteria",
    details: (req) => req.body,
}), pointCriteriaController.getSupportedPaymentMethods );

module.exports = router; 