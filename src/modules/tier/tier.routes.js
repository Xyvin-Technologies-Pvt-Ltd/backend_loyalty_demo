const express = require("express");
const router = express.Router();
const tier_controller = require("./tier.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  cacheMiddleware,
  cacheKeys,
  cachePatterns,
} = require("../../middlewares/redis_cache/cache.middleware");
const {
  cacheInvalidationMiddleware,
  enhancedCacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
// Create audit middleware for the tier module
const tierAudit = createAuditMiddleware("tier");

router.use(authorizePermission("MANAGE_SETTINGS"));

// Create and list tiers
router.post(
  "/",
  tierAudit.captureResponse(),
  tierAudit.adminAction("create_tier", {
    description: "Admin created a new tier",
    targetModel: "Tier",
    details: (req) => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allTiers }, // Clear all tiers cache (all query variations)
    cacheKeys.tierById
  ),
  tier_controller.create
);

router.get(
  "/",
  tierAudit.captureResponse(),
  tierAudit.adminAction("list_tiers", {
    description: "Admin viewed all tiers",
    targetModel: "Tier",
  }),
  cacheMiddleware(60, cacheKeys.allTiers),
  tier_controller.list
);

// Get, update, and delete a specific tier
router.get(
  "/:id",
  tierAudit.captureResponse(),
  tierAudit.adminAction("view_tier", {
    description: "Admin viewed a tier",
    targetModel: "Tier",
    targetId: (req) => req.params.id,
  }),
  cacheMiddleware(60, cacheKeys.tierById),
  tier_controller.get_tier
);

router.put(
  "/:id",
  tierAudit.captureResponse(),
  tierAudit.adminAction("update_tier", {
    description: "Admin updated a tier",
    targetModel: "Tier",
    targetId: (req) => req.params.id,
    details: (req) => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allTiers }, // Clear all tiers cache (all query variations)
    cacheKeys.tierById
  ),
  tier_controller.update_tier
);

router.delete(
  "/:id",
  tierAudit.adminAction("delete_tier", {
    description: "Admin deleted a tier",
    targetModel: "Tier",
    targetId: (req) => req.params.id,
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allTiers }, // Clear all tiers cache (all query variations)
    cacheKeys.tierById
  ),
  tier_controller.delete_tier
);

// Get customer tier progress
router.get(
  "/progress/:customerId",
  tierAudit.captureResponse(),
  tierAudit.adminAction("view_customer_tier_progress", {
    description: "Admin viewed customer tier progress",
    targetModel: "Customer",
    targetId: (req) => req.params.customerId,
  }),
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const { app_type } = req.query;
      const response_handler = require("../../helpers/response_handler");

      const progressResult = await tier_controller.getCustomerTierProgress(
        customerId,
        app_type || null
      );

      if (!progressResult.success) {
        return response_handler(res, 400, progressResult.message);
      }

      return response_handler(
        res,
        200,
        "Customer tier progress retrieved successfully",
        progressResult
      );
    } catch (error) {
      return response_handler(
        res,
        500,
        `Error retrieving tier progress: ${error.message}`
      );
    }
  }
);

module.exports = router;
