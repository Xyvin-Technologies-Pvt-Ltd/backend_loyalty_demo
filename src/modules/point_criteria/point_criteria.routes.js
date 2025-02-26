const express = require("express");
const router = express.Router();
const point_criteria_controller = require("./point_criteria.controller");
const protect = require("../../middlewares/protect");

router.use(protect);
router
  .route("/")
  .post(point_criteria_controller.create)
  .get(point_criteria_controller.list);

router
  .route("/:id")
  .get(point_criteria_controller.get_criteria)
  .put(point_criteria_controller.update_criteria)
  .delete(point_criteria_controller.delete_criteria);

module.exports = router;
