const express = require("express");
const router = express.Router();
const transaction_controller = require("./transaction.controller");
const protect = require("../../middlewares/protect");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for the transaction module
const transactionAudit = createAuditMiddleware("transaction");

router.use(protect);

// Get all transactions with audit logging
router.get(
  "/",
  transactionAudit.dataAccess("list_transactions", {
    description: "User viewed transaction list",
    targetModel: "Transaction",
    details: req => ({
      filters: req.query
    })
  }),
  transaction_controller.list
);

// Create a new transaction with audit logging
router.post(
  "/",
  transactionAudit.captureResponse(),
  transactionAudit.pointTransaction("create_transaction", {
    description: "User created a new transaction",
    targetModel: "Transaction",
    details: req => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    }
  }),
  transaction_controller.create
);

module.exports = router;
