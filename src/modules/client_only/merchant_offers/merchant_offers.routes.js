const express = require("express");
const router = express.Router();
const merchantOffersController = require("./merchant_offers.controller");
const { sdkAuth, sdkUserAuth } = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
router.use(sdkAuth([]));
router.use(sdkUserAuth);

// Create audit middleware for merchant offers
const auditMiddleware = createAuditMiddleware("merchant_offers");

// Get available offers with pagination and filters
router.get(
  "/available",
  auditMiddleware.captureResponse(),
  auditMiddleware.sdkAction("get_available_offers", {
    description: "Get available offers with pagination and filters",
    targetModel: "MerchantOffer",
    details: (req) => req.query,
  }),
  merchantOffersController.getAvailableOffers
);

// Get specific offer details
router.get(
  "/:offer_id",
  auditMiddleware.captureResponse(),
  auditMiddleware.sdkAction("get_offer_details", {
    description: "Get specific offer details",
    targetModel: "MerchantOffer",
    details: (req) => req.params,
  }),
  merchantOffersController.getOfferDetails
);

// Check offer eligibility
router.post(
  "/:offer_id/check-eligibility",
  auditMiddleware.captureResponse(),
  auditMiddleware.sdkAction("check_offer_eligibility", {
    description: "Check offer eligibility",
    targetModel: "MerchantOffer",
    details: (req) => ({ ...req.params, ...req.body }),
  }),
  merchantOffersController.checkOfferEligibility
);

// Get user's claimed offers
router.get(
  "/claimed/list",
  auditMiddleware.captureResponse(),
  auditMiddleware.sdkAction("get_my_claimed_offers", {
    description: "Get user's claimed offers",
    targetModel: "MerchantOffer",
    details: (req) => req.query,
  }),
  merchantOffersController.getMyClaimedOffers
);

// Redeem a dynamic coupon
router.post(
  "/redeem",
  auditMiddleware.captureResponse(),
  auditMiddleware.sdkAction("redeem_dynamic_coupon", {
    description: "Redeem a dynamic coupon",
    targetModel: "CouponCode",
    details: (req) => ({
      couponId: req.body.couponId,
      pin: req.body.pin,
    }),
  }),
  merchantOffersController.redeemDynamicCoupon
);

module.exports = router;
