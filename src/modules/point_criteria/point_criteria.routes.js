const express = require("express");
const router = express.Router();
const point_criteria_controller = require("./point_criteria.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  cacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const {
  cacheMiddleware,
  cacheKeys,
} = require("../../middlewares/redis_cache/cache.middleware");

// Create audit middleware for the point_criteria module
const criteriaAudit = createAuditMiddleware("point_criteria");

router.use(authorizePermission("MANAGE_SETTINGS"));

// Create and list point criteria
router.post(
  "/",
  criteriaAudit.captureResponse(),
  criteriaAudit.adminAction("create_criteria", {
    description: "Admin created a new point criteria",
    targetModel: "PointCriteria",
    details: (req) => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  cacheInvalidationMiddleware(
    cacheKeys.allPointCriteria,
    cacheKeys.pointCriteriaById
  ),
  point_criteria_controller.create
);

router.get(
  "/",
  criteriaAudit.adminAction("list_criteria", {
    description: "Admin viewed all point criteria",
    targetModel: "PointCriteria",
  }),
  cacheMiddleware(0, cacheKeys.allPointCriteria),
  point_criteria_controller.list
);

// Get, update, and delete a specific point criteria
router.get(
  "/:id",
  criteriaAudit.adminAction("view_criteria", {
    description: "Admin viewed a point criteria",
    targetModel: "PointCriteria",
    targetId: (req) => req.params.id,
  }),
  cacheMiddleware(60, cacheKeys.pointCriteriaById),
  point_criteria_controller.get_criteria
);

router.put(
  "/:id",
  criteriaAudit.captureResponse(),
  criteriaAudit.adminAction("update_criteria", {
    description: "Admin updated a point criteria",
    targetModel: "PointCriteria",
    targetId: (req) => req.params.id,
    details: (req) => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  cacheInvalidationMiddleware(
    cacheKeys.allPointCriteria,
    cacheKeys.pointCriteriaById
  ),
  point_criteria_controller.update_criteria
);

router.delete(
  "/:id",
  criteriaAudit.captureResponse(),
  criteriaAudit.adminAction("delete_criteria", {
    description: "Admin deleted a point criteria",
    targetModel: "PointCriteria",
    targetId: (req) => req.params.id,
  }),
  cacheInvalidationMiddleware(
    cacheKeys.allPointCriteria,
    cacheKeys.pointCriteriaById
  ),
  point_criteria_controller.delete_criteria
);

module.exports = router;
