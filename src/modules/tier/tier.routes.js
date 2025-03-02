const express = require("express");
const router = express.Router();
const tier_controller = require("./tier.controller");
const { protect } = require("../../middlewares/protect");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for the tier module
const tierAudit = createAuditMiddleware("tier");

router.use(protect);

// Create and list tiers
router.post(
  "/",
  tierAudit.captureResponse(),
  tierAudit.adminAction("create_tier", {
    description: "Admin created a new tier",
    targetModel: "Tier",
    details: req => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    }
  }),
  tier_controller.create
);

router.get(
  "/",
  tierAudit.adminAction("list_tiers", {
    description: "Admin viewed all tiers",
    targetModel: "Tier"
  }),
  tier_controller.list
);

// Get, update, and delete a specific tier
router.get(
  "/:id",
  tierAudit.adminAction("view_tier", {
    description: "Admin viewed a tier",
    targetModel: "Tier",
    targetId: req => req.params.id
  }),
  tier_controller.get_tier
);

router.put(
  "/:id",
  tierAudit.captureResponse(),
  tierAudit.adminAction("update_tier", {
    description: "Admin updated a tier",
    targetModel: "Tier",
    targetId: req => req.params.id,
    details: req => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    }
  }),
  tier_controller.update_tier
);

router.delete(
  "/:id",
  tierAudit.adminAction("delete_tier", {
    description: "Admin deleted a tier",
    targetModel: "Tier",
    targetId: req => req.params.id
  }),
  tier_controller.delete_tier
);

module.exports = router;
