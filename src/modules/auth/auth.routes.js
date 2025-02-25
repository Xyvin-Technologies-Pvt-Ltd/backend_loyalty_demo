const express = require("express");
const router = express.Router();
const auth_controller = require("./auth.controller");
const admin_protect = require("../../middlewares/admin_protect");

router.post("/login", auth_controller.login);
router.post("/signup", admin_protect, auth_controller.signup);

module.exports = router;
