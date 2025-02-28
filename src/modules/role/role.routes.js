const express = require("express");
const router = express.Router();
const role_controller = require("./role.controller");
const protect = require("../../middlewares/protect");

router.use(protect);

router.route("/").post(role_controller.create).get(role_controller.list);

router
  .route("/:id")
  .get(role_controller.get_role)
  .put(role_controller.update_role)
  .delete(role_controller.delete_role);

module.exports = router;
