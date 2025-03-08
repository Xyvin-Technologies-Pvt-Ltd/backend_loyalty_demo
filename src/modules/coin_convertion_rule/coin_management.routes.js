const express = require("express");
const router = express.Router();
const {
  createCoinConversionRule,
  getAllCoinConversionRules,
  updateCoinConversionRule,
  resetCoinConversionRule,
} = require("./coin_management.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const {createAuditMiddleware} = require("../audit");    


const coinManagementAudit = createAuditMiddleware("coin_management");

router.use(authorizePermission("VIEW_COIN_MANAGEMENT"));


router.post("/", coinManagementAudit.captureResponse(), coinManagementAudit.adminAction("create_coin_conversion_rule", {
    description: "Admin created coin conversion rule",
    targetModel: "CoinConversionRule",
    details: req => req.body
}), createCoinConversionRule);


router.get("/", coinManagementAudit.adminAction("get_all_coin_conversion_rules", {
    description: "Admin fetched all coin conversion rules",
    targetModel: "CoinConversionRule",
    details: req => req.body
}), getAllCoinConversionRules);


router.put("/:id", coinManagementAudit.captureResponse(), coinManagementAudit.adminAction("update_coin_conversion_rule", {
    description: "Admin updated coin conversion rule",
    targetModel: "CoinConversionRule",
    details: req => req.params
}), updateCoinConversionRule);


router.put("/reset", coinManagementAudit.captureResponse(), coinManagementAudit.adminAction("reset_coin_conversion_rule", {
    description: "Admin reset coin conversion rule",
    targetModel: "CoinConversionRule",
}), resetCoinConversionRule);

module.exports = router;
