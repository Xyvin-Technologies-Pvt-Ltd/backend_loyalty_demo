const express = require("express");
const router = express.Router();
const pointsExpirationController = require("./points_expiration.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for the points_expiration module
const expirationAudit = createAuditMiddleware("points_expiration_rules");

// Get current points expiration rules (public)
router.get(
    "/",
    expirationAudit.dataAccess("view_rules", {
        description: "User viewed points expiration rules",
        targetModel: "PointsExpirationRules"
    }),
    pointsExpirationController.getRules
);

// Create or update points expiration rules (requires MANAGE_POINTS permission)
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
    pointsExpirationController.createOrUpdateRules
);

// Get user's points with expiration information (requires VIEW_POINTS_HISTORY permission)
router.get(
    "/users/:user_id",
    authorizePermission("VIEW_POINTS_HISTORY"),
    expirationAudit.dataAccess("view_user_points_expiry", {
        description: "Admin viewed user's points expiration information",
        targetModel: "User",
        targetId: req => req.params.user_id
    }),
    pointsExpirationController.getUserPointsWithExpiry
);

// Process expired points (requires MANAGE_POINTS permission)
router.post(
    "/process",
    authorizePermission("MANAGE_POINTS"),
    expirationAudit.captureResponse(),
    expirationAudit.pointTransaction("process_expired_points", {
        description: "Admin processed expired points",
        details: req => req.body
    }),
    pointsExpirationController.processExpiredPoints
);

// Get points expiring soon for a user (requires VIEW_POINTS_HISTORY permission)
router.get(
    "/users/:user_id/expiring-soon",
    authorizePermission("VIEW_POINTS_HISTORY"),
    expirationAudit.dataAccess("view_points_expiring_soon", {
        description: "Admin viewed user's points expiring soon",
        targetModel: "User",
        targetId: req => req.params.user_id,
        details: req => ({
            daysThreshold: req.query.days || 30
        })
    }),
    pointsExpirationController.getPointsExpiringSoon
);

module.exports = router; 