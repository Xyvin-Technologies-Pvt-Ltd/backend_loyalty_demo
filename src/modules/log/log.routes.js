const express = require("express");
const router = express.Router();
const log_controller = require("./log.controller");
const admin_protect = require("../../middlewares/admin_protect");

router.use(admin_protect);
router.get("/:type", log_controller.log_file);

module.exports = router;
