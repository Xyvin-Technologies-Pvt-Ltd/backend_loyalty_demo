const express = require("express");
const router = express.Router();
const log_controller = require("./log.controller");
const { protect } = require("../../middlewares/auth/protect");

router.use(protect);
router.get("/:type", log_controller.log_file);

module.exports = router;
