const express = require("express");
const router = express.Router();
const merchantOffersController = require("./merchant_offers.controller");
const { sdkAuth ,sdkUserAuth} = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
router.use(sdkAuth);
router.use(sdkUserAuth);

// Create audit middleware for merchant offers
const auditMiddleware = createAuditMiddleware("merchant_offers");

// Get available offers with pagination and filters
router.get("/available", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("get_available_offers", {
    description: "Get available offers with pagination and filters",
    targetModel: "MerchantOffer",
    details: (req) => req.body,
}), async (req, res) => {
    const response = await merchantOffersController.getAvailableOffers(req, res);
    req.auditLog.response = response;
});

// Get specific offer details
router.get("/:offer_id", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("get_offer_details", {
    description: "Get specific offer details",
    targetModel: "MerchantOffer",
    details: (req) => req.params,
}), async (req, res) => {
    const response = await merchantOffersController.getOfferDetails(req, res);
    req.auditLog.response = response;
});

// Check offer eligibility
router.post("/:offer_id/check-eligibility", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("check_offer_eligibility", {
    description: "Check offer eligibility",
    targetModel: "MerchantOffer",
    details: (req) => req.params,
}), async (req, res) => {
    const response = await merchantOffersController.checkOfferEligibility(req, res);
    req.auditLog.response = response;
});

// Get user's claimed offers
router.get("/claimed/list", auditMiddleware.captureResponse(),auditMiddleware.sdkAction("get_my_claimed_offers", {
    description: "Get user's claimed offers",
    targetModel: "MerchantOffer",
    details: (req) => req.body,
}), async (req, res) => {
    const response = await merchantOffersController.getMyClaimedOffers(req, res);
    req.auditLog.response = response;
});

module.exports = router; 