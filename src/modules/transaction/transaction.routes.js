const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByCustomer,
  updateTransactionStatus,
  getCustomerPointBalance,
} = require("./transaction.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for transactions
const transactionAudit = createAuditMiddleware("transaction");

// Routes that require VIEW_TRANSACTIONS permission
router.get(
  "/",
  authorizePermission("VIEW_TRANSACTIONS"),
  transactionAudit.captureResponse(),
  transactionAudit.adminAction("view_transactions", {
    description: "Admin viewed all transactions",
    targetModel: "Transaction",
  }),
  getAllTransactions
);

router.get(
  "/:id",
  authorizePermission("VIEW_TRANSACTIONS"),
  transactionAudit.captureResponse(),
  transactionAudit.adminAction("view_transaction", {
    description: "Admin viewed a transaction",
    targetModel: "Transaction",
  }),
  getTransactionById
);

// Routes that require MANAGE_POINTS permission
router.post(
  "/",
  authorizePermission("MANAGE_POINTS"),
  transactionAudit.captureResponse(),
  transactionAudit.adminAction("create_transaction", {
    description: "Admin created a new transaction",
    targetModel: "Transaction",
  }),
  createTransaction
);

router.patch(
  "/:id/status",
  authorizePermission("MANAGE_POINTS"),
  transactionAudit.captureResponse(),
  transactionAudit.adminAction("update_transaction_status", {
    description: "Admin updated a transaction status",
    targetModel: "Transaction",
  }),
  updateTransactionStatus
);

// Customer-specific transaction routes
router.get(
  "/customer/:customerId",
  authorizePermission("VIEW_TRANSACTIONS"),
  transactionAudit.captureResponse(),
  transactionAudit.adminAction("view_customer_transactions", {
    description: "Admin viewed customer transactions",
    targetModel: "Transaction",
  }),
  getTransactionsByCustomer
);

router.get(
  "/customer/:customerId/balance",
  authorizePermission("VIEW_TRANSACTIONS"),
  transactionAudit.captureResponse(),
  transactionAudit.adminAction("view_customer_balance", {
    description: "Admin viewed customer point balance",
    targetModel: "Transaction",
  }),
  getCustomerPointBalance
);

module.exports = router;
