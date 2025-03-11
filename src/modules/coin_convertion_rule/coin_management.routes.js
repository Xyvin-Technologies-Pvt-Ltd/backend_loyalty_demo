const express = require("express");
const router = express.Router();
const {
  createCoinConversionRule,
  getAllCoinConversionRules,
  updateCoinConversionRule,
  resetCoinConversionRule,
} = require("./coin_management.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  cacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const {
  cacheMiddleware,
  cacheKeys,
} = require("../../middlewares/redis_cache/cache.middleware");

const coinManagementAudit = createAuditMiddleware("coin_management");

router.use(authorizePermission("VIEW_COIN_MANAGEMENT"));


//add and update coin conversion rule
router.post(
  "/",
  coinManagementAudit.captureResponse(),
  coinManagementAudit.adminAction("create_coin_conversion_rule", {
    description: "Admin created/updated coin conversion rule",
    targetModel: "CoinConversionRule",
    details: (req) => req.body,
  }),
  cacheInvalidationMiddleware(cacheKeys.allCoinConversionRules),
  createCoinConversionRule
);

router.get(
  "/",
  coinManagementAudit.adminAction("get_all_coin_conversion_rules", {
    description: "Admin fetched all coin conversion rules",
    targetModel: "CoinConversionRule",
    details: (req) => req.body,
  }),
  cacheMiddleware(60, cacheKeys.allCoinConversionRules),
  getAllCoinConversionRules
);


router.get(
  "/reset",
  coinManagementAudit.captureResponse(),
  coinManagementAudit.adminAction("reset_coin_conversion_rule", {
    description: "Admin reset coin conversion rule",
    targetModel: "CoinConversionRule",
  }),
  cacheInvalidationMiddleware(cacheKeys.allCoinConversionRules),
  resetCoinConversionRule
);

module.exports = router;
