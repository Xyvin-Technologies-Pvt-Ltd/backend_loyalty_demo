const express = require("express");
const router = express.Router();
const kedmah_offers_controller = require("./kedmah_offers.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const { cacheInvalidationMiddleware } = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const { cacheMiddleware, cacheKeys } = require("../../middlewares/redis_cache/cache.middleware");

// Create audit middleware for the kedmah_offers module
const kedmahOffersAudit = createAuditMiddleware("kedmah_offers");

// Admin routes for managing offers (requires MANAGE_KEDMAH_OFFERS permission)
router.post(
    "/",
    authorizePermission("MANAGE_KEDMAH_OFFERS"),
    kedmahOffersAudit.captureResponse(),
    kedmahOffersAudit.adminAction("create_kedmah_offer", {
        description: "Admin created a new Kedmah loyalty offer",
        targetModel: "KedmahOffers",
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allKedmahOffers, cacheKeys.kedmahOfferById),
    kedmah_offers_controller.create
);

router.get(
    "/",
    authorizePermission("MANAGE_KEDMAH_OFFERS", "VIEW_KEDMAH_OFFERS"),
    kedmahOffersAudit.adminAction("list_kedmah_offers", {
        description: "User viewed all Kedmah loyalty offers",
        targetModel: "KedmahOffers"
    }),
    cacheMiddleware(60, cacheKeys.allKedmahOffers),
    kedmah_offers_controller.list
);

router.get(
    "/:id",
    authorizePermission("MANAGE_KEDMAH_OFFERS", "VIEW_KEDMAH_OFFERS"),
    kedmahOffersAudit.adminAction("view_kedmah_offer", {
        description: "User viewed a Kedmah loyalty offer",
        targetModel: "KedmahOffers",
        targetId: req => req.params.id
    }),
    cacheMiddleware(60, cacheKeys.kedmahOfferById),
    kedmah_offers_controller.get_offer
);

router.put(
    "/:id",
    authorizePermission("MANAGE_KEDMAH_OFFERS"),
    kedmahOffersAudit.captureResponse(),
    kedmahOffersAudit.adminAction("update_kedmah_offer", {
        description: "Admin updated a Kedmah loyalty offer",
        targetModel: "KedmahOffers",
        targetId: req => req.params.id,
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allKedmahOffers, cacheKeys.kedmahOfferById),
    kedmah_offers_controller.update_offer
);

router.delete(
    "/:id",
    authorizePermission("MANAGE_KEDMAH_OFFERS"),
    kedmahOffersAudit.captureResponse(),
    kedmahOffersAudit.adminAction("delete_kedmah_offer", {
        description: "Admin deleted a Kedmah loyalty offer",
        targetModel: "KedmahOffers",
        targetId: req => req.params.id
    }),
    cacheInvalidationMiddleware(cacheKeys.allKedmahOffers, cacheKeys.kedmahOfferById),
    kedmah_offers_controller.delete_offer
);

// User routes for interacting with offers
router.post(
    "/check-eligibility",
    authorizePermission("USE_KEDMAH_OFFERS"),
    kedmahOffersAudit.adminAction("check_kedmah_offer_eligibility", {
        description: "User checked eligibility for a Kedmah loyalty offer",
        targetModel: "KedmahOffers",
        targetId: req => req.body.offerId,
        details: req => req.body
    }),
    kedmah_offers_controller.check_user_eligibility
);

router.post(
    "/redeem",
    authorizePermission("USE_KEDMAH_OFFERS"),
    kedmahOffersAudit.captureResponse(),
    kedmahOffersAudit.adminAction("redeem_kedmah_offer", {
        description: "User redeemed a Kedmah loyalty offer",
        targetModel: "KedmahOffers",
        targetId: req => req.body.offerId,
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allKedmahOffers, cacheKeys.kedmahOfferById),
    kedmah_offers_controller.redeem_offer
);

module.exports = router; 