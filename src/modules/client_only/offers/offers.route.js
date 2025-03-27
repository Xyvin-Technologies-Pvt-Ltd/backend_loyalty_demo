const express = require("express");
const router = express.Router();
const offersController = require("./offers.controller");
const { sdkAuth } = require("../../../middlewares/auth/sdk_auth");
const { sdkUserAuth } = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../../middleware/audit_middleware");

// Apply SDK authentication middleware
router.use(sdkAuth());
router.use(sdkUserAuth);

// Create audit middleware for offers
const SdkOfferAudit = createAuditMiddleware("offer");

// Get all Kedmah offers
router.get(
    "/kedmah-offers",
    SdkOfferAudit.captureResponse(),
    SdkOfferAudit.sdkAction("get_kedmah_offers", {
        description: "Customer retrieved available Kedmah offers",
        targetModel: "KedmahOffer",
        details: (req) => ({
            filters: req.query
        })
    }),
    offersController.getKedmahOffers
);

// Get specific Kedmah offer
router.get(
    "/kedmah-offers/:id",
    SdkOfferAudit.captureResponse(),
    SdkOfferAudit.sdkAction("get_kedmah_offer", {
        description: "Customer retrieved specific Kedmah offer",
        targetModel: "KedmahOffer",
        details: (req) => ({
            offer_id: req.params.id,
            transaction_value: req.query.transaction_value,
            payment_method: req.query.payment_method
        })
    }),
    offersController.getKedmahOffer
);

// Check offer eligibility
router.post(
    "/kedmah-offers/check-eligibility",
    SdkOfferAudit.captureResponse(),
    SdkOfferAudit.sdkAction("check_offer_eligibility", {
        description: "Customer checked offer eligibility",
        targetModel: "KedmahOffer",
        details: (req) => ({
            offer_id: req.body.offer_id,
            transaction_value: req.body.transaction_value,
            payment_method: req.body.payment_method
        })
    }),
    offersController.checkOfferEligibility
);

module.exports = router;
