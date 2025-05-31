const express = require("express");
const router = express.Router();
const {
  createAppType,
  getAllAppTypes,
  getAppTypeById,
  updateAppType,
  deleteAppType,
} = require("./app_type.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const { cacheMiddleware, cacheKeys,cachePatterns } = require("../../middlewares/redis_cache/cache.middleware");
const { cacheInvalidationMiddleware,enhancedCacheInvalidationMiddleware } = require("../../middlewares/redis_cache/cache_invalidation.middleware");


const appTypeAudit = createAuditMiddleware("app_type");

router.use(authorizePermission("MANAGE_APP_TYPES"));


router.post(
  "/",
  appTypeAudit.captureResponse(),
  appTypeAudit.adminAction("create_app_type", {
    description: "Admin created a new app type",
    targetModel: "AppType",
  }),
    enhancedCacheInvalidationMiddleware(
      { pattern: cachePatterns.allAppTypes }, // Clear all app types cache (all query variations)
      cacheKeys.allAppTypes,
      cacheKeys.appTypeById
    ),
  createAppType
);
router.get(
  "/",
  appTypeAudit.captureResponse(),
  appTypeAudit.adminAction("view_app_types", {
    description: "Admin viewed all app types",
    targetModel: "AppType",
  }),
    cacheMiddleware(60, cacheKeys.allAppTypes),
  getAllAppTypes
);
router.get(
  "/:id",
  appTypeAudit.captureResponse(),
  appTypeAudit.adminAction("view_app_type", {
    description: "Admin viewed an app type",
    targetModel: "AppType",
  }),
  cacheMiddleware(60, cacheKeys.appTypeById),
  getAppTypeById
);
router.put(
  "/:id",
  appTypeAudit.captureResponse(),
  appTypeAudit.adminAction("update_app_type", {
    description: "Admin updated an app type",
    targetModel: "AppType",
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allAppTypes }, // Clear all app types cache (all query variations)
    cacheKeys.allAppTypes,
    cacheKeys.appTypeById
  ),
  updateAppType
);
router.delete(
  "/:id",
  appTypeAudit.captureResponse(),
  appTypeAudit.adminAction("delete_app_type", {
    description: "Admin deleted an app type",
    targetModel: "AppType",
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allAppTypes }, // Clear all app types cache (all query variations)
    cacheKeys.allAppTypes,
    cacheKeys.appTypeById
  ),
  deleteAppType
);

module.exports = router;
