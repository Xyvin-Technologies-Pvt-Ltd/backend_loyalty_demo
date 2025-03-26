const express = require("express");
const router = express.Router();
const pointsExpirationController = require("./points_expiration.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const { cacheInvalidationMiddleware } = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const { cacheMiddleware, cacheKeys } = require("../../middlewares/redis_cache/cache.middleware");


// Create audit middleware for the points_expiration module
const expirationAudit = createAuditMiddleware("points_expiration_rules");

// Get current points expiration rules (public)
router.get(
    "/",
    expirationAudit.dataAccess("view_rules", {
        description: "User viewed points expiration rules",
        targetModel: "PointsExpirationRules"
    }),
    cacheMiddleware(60, cacheKeys.allPointsExpirationRules),
    pointsExpirationController.getAllRules
);

// Create expiration rules (requires MANAGE_POINTS permission)
router.post(
    "/",
    authorizePermission("MANAGE_POINTS"),
    expirationAudit.captureResponse(),
    expirationAudit.adminAction("update_rules", {
        description: "Admin updated points expiration rules",
        targetModel: "PointsExpirationRules",
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allPointsExpirationRules),
    pointsExpirationController.createRules
);


//getby id
router.get(
    "/:id",
    authorizePermission(),
    expirationAudit.dataAccess("view_rule", {
        description: "User viewed points expiration rule",
        targetModel: "PointsExpirationRules"
    }),
    cacheMiddleware(60, cacheKeys.pointsExpirationRulesById),
    pointsExpirationController.getRuleById
);

//get by appid
router.get(
    "/app/:appId",
    authorizePermission(),
    expirationAudit.dataAccess("view_rule", {
        description: "User viewed points expiration rule",
        targetModel: "PointsExpirationRules"
    }),
    pointsExpirationController.getRuleByAppId
);

//edit rule
router.put(
    "/:id",
    authorizePermission(),
    expirationAudit.captureResponse(),
    expirationAudit.dataModification("update_rule", {
        description: "Admin updated points expiration rule",
        targetModel: "PointsExpirationRules",
        details: req => req.body
    }),
    cacheInvalidationMiddleware(cacheKeys.allPointsExpirationRules, cacheKeys.pointsExpirationRulesById),
    pointsExpirationController.editRule
);

//delete rule
router.delete(
    "/:id",
    authorizePermission(),
    expirationAudit.dataModification("delete_rule", {
        description: "Admin deleted points expiration rule",
        targetModel: "PointsExpirationRules"
    }),
    cacheInvalidationMiddleware(cacheKeys.allPointsExpirationRules, cacheKeys.pointsExpirationRulesById),
    pointsExpirationController.deleteRule
);
module.exports = router; 