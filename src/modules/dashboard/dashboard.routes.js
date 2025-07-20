const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("./dashboard.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const {
    cacheMiddleware,
    cacheKeys,
    cachePatterns,
  } = require("../../middlewares/redis_cache/cache.middleware");


router.get("/stats", authorizePermission("VIEW_CUSTOMERS"), cacheMiddleware(60, cacheKeys.allDashboard),  getDashboardStats);

module.exports = router;
