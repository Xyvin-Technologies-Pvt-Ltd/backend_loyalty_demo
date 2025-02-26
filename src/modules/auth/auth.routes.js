const express = require("express");
const router = express.Router();
const auth_controller = require("./auth.controller");
const protect = require("../../middlewares/protect");
const key_protect = require("../../middlewares/key_protect");

router.post("/login", key_protect, auth_controller.login);
router.post("/signup", protect, auth_controller.signup);
router.post("/register", key_protect, auth_controller.register);

module.exports = router;
