const express = require("express");
const router = express.Router();
const transaction_controller = require("./transaction.controller");
const protect = require("../../middlewares/protect");

router.use(protect);

router
  .route("/")
  .get(transaction_controller.list)
  .post(transaction_controller.create);

module.exports = router;
