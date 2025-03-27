const express = require("express");
const router = express.Router();
const merchantOffersController = require("./merchant_offers.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth");
const { createAuditMiddleware } = require("../../../middlewares/audit");

// Apply SDK authentication middleware
router.use(sdkAuth);
router.use(sdkUserAuth);

// Create audit middleware for merchant offers
const auditMiddleware = createAuditMiddleware("merchant_offers");

// Get available offers with pagination and filters
router.get("/available", auditMiddleware, async (req, res) => {
    const response = await merchantOffersController.getAvailableOffers(req, res);
    req.auditLog.response = response;
});

// Get specific offer details
router.get("/:offer_id", auditMiddleware, async (req, res) => {
    const response = await merchantOffersController.getOfferDetails(req, res);
    req.auditLog.response = response;
});

// Check offer eligibility
router.post("/:offer_id/check-eligibility", auditMiddleware, async (req, res) => {
    const response = await merchantOffersController.checkOfferEligibility(req, res);
    req.auditLog.response = response;
});

// Get user's claimed offers
router.get("/claimed/list", auditMiddleware, async (req, res) => {
    const response = await merchantOffersController.getMyClaimedOffers(req, res);
    req.auditLog.response = response;
});

module.exports = router; 