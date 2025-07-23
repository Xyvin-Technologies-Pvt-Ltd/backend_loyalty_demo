const express = require("express");
const router = express.Router();
const { authorizePermission } = require('../../middlewares/auth/auth');
const { createAuditMiddleware } = require("../audit");
const { cacheMiddleware, cacheKeys,cachePatterns } = require("../../middlewares/redis_cache/cache.middleware");   
const { cacheInvalidationMiddleware,enhancedCacheInvalidationMiddleware } = require("../../middlewares/redis_cache/cache_invalidation.middleware");
// Create audit middleware for the tier module
const tierAudit = createAuditMiddleware("tier_eligibility");

const {
    createTierEligibilityCriteria,
    getAllTierEligibilityCriteria,
    getTierEligibilityCriteriaById,
    updateTierEligibilityCriteria,
    deleteTierEligibilityCriteria,
    getCriteriaForTier
} = require("./tier_eligibility.controller");

// Middleware imports (adjust paths as needed)
router.use(authorizePermission("MANAGE_SETTINGS"));
const {
    createTierEligibilitySchema,
    updateTierEligibilitySchema
} = require("./tier_eligibility.validator");

// Routes
router.post(
    "/",
    tierAudit.captureResponse(),
    createTierEligibilityCriteria
);

router.get(
    "/",
    tierAudit.captureResponse(),
    getAllTierEligibilityCriteria
);

router.get(
    "/:id",
    tierAudit.captureResponse(),
    getTierEligibilityCriteriaById
);

router.put(
    "/:id",
    tierAudit.captureResponse(),
    updateTierEligibilityCriteria
);

router.delete(
    "/:id",
    tierAudit.captureResponse(),
    deleteTierEligibilityCriteria
);

router.get(
    "/tier/:tier_id",
    tierAudit.captureResponse(),
    getCriteriaForTier
);

module.exports = router; 