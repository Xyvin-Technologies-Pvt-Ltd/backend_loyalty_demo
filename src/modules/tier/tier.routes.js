const express = require("express");
const router = express.Router();
const tier_controller = require("./tier.controller");
const protect = require("../../middlewares/protect");

router.use(protect);

router.route("/").post(tier_controller.create).get(tier_controller.list);

router
  .route("/:id")
  .get(tier_controller.get_tier)
  .put(tier_controller.update_tier)
  .delete(tier_controller.delete_tier);

module.exports = router;
