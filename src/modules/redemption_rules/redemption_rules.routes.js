const express = require("express");
const router = express.Router();
const redemption_rules_controller = require("./redemption_rules.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  cacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const {
  cacheMiddleware,
  cacheKeys,
} = require("../../middlewares/redis_cache/cache.middleware");

// Create audit middleware for the redemption_rules module
const redemptionAudit = createAuditMiddleware("redemption_rules");

// Admin routes (protected by both API key and JWT)
// Get all redemption rules
router.get(
  "/",
  authorizePermission(),
  redemptionAudit.dataAccess("view_rules", {
    description: "User viewed redemption rules",
    targetModel: "RedemptionRules",
  }),
  cacheMiddleware(60, cacheKeys.allRedemptionRules),
  redemption_rules_controller.getRules
);

// Create or update redemption rules
router.post(
  "/",
  authorizePermission(),
  redemptionAudit.captureResponse(),
  redemptionAudit.adminAction("update_rules", {
    description: "Admin updated redemption rules",
    targetModel: "RedemptionRules",
    details: (req) => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  cacheInvalidationMiddleware(cacheKeys.allRedemptionRules),
  redemption_rules_controller.createOrUpdateRules
);

// Update redemption status

router.put(
  "/transaction/:transaction_id/status",
  authorizePermission(),
  redemptionAudit.captureResponse(),
  redemptionAudit.dataModification("update_redemption_status", {
    description: "Admin updated redemption transaction status",
    targetModel: "Transaction",
    targetId: (req) => req.params.transaction_id,
    details: (req) => ({
      status: req.body.status,
      notes: req.body.notes,
    }),
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  cacheInvalidationMiddleware(cacheKeys.allRedemptionRules),
  redemption_rules_controller.updateRedemptionStatus
);

// User routes (protected by API key only)
//!for sdk only - need to seperated from the above routes
// Validate redemption
router.post(
  "/validate",
  authorizePermission(),
  redemptionAudit.captureResponse(),
  redemptionAudit.pointTransaction("validate_redemption", {
    description: "User validated a redemption request",
    details: (req) => req.body,
  }),
  cacheInvalidationMiddleware(cacheKeys.redemptionHistoryByUser),
  redemption_rules_controller.validateRedemption
);

// Get redemption history
router.get(
  "/history/:user_id",
  authorizePermission(),
  redemptionAudit.dataAccess("view_redemption_history", {
    description: "User viewed redemption history",
    targetModel: "User",
    targetId: (req) => req.params.user_id,
    details: (req) => ({
      filters: req.query,
    }),
  }),
  cacheMiddleware(60, cacheKeys.redemptionHistoryByUser),
  redemption_rules_controller.getRedemptionHistory
);

module.exports = router;
