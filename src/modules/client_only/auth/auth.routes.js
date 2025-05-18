const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");

router.post("/register", authController.customer_register);

module.exports = router;
