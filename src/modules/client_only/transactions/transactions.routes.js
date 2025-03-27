const express = require("express");
const router = express.Router();
const transactionsController = require("./transactions.controller");
const { createAuditMiddleware } = require("../../audit");
const { sdkAuth } = require("../../../middlewares/auth/sdk_auth");
const { sdkUserAuth } = require("../../../middlewares/auth/sdk_auth");

// Apply SDK authentication middleware
router.use(sdkAuth());
router.use(sdkUserAuth);

// Create audit middleware for transactions
const SdkTransactionAudit = createAuditMiddleware("transaction");

// Get all transactions for a customer
router.get(
    "/:customer_id/transactions",
    SdkTransactionAudit.captureResponse(),
    SdkTransactionAudit.sdkAction("get_customer_transactions", {
        description: "Customer retrieved their transactions",
        targetModel: "Transaction",
        details: (req) => ({
            customer_id: req.params.customer_id,
            filters: req.query
        })
    }),
    transactionsController.getMyTransactions
);

// Get specific transaction
router.get(
    "/transactions/:transaction_id",
    SdkTransactionAudit.captureResponse(),
    SdkTransactionAudit.sdkAction("get_transaction_details", {
        description: "Customer retrieved transaction details",
        targetModel: "Transaction",
        details: (req) => ({
            transaction_id: req.params.transaction_id,
            customer_id: req.query.customer_id
        })
    }),
    transactionsController.getTransactionById
);

// Get transaction summary
router.get(
    "/:customer_id/transactions/summary",
    SdkTransactionAudit.captureResponse(),
    SdkTransactionAudit.sdkAction("get_transaction_summary", {
        description: "Customer retrieved transaction summary",
        targetModel: "Transaction",
        details: (req) => ({
            customer_id: req.params.customer_id,
            date_range: {
                start_date: req.query.start_date,
                end_date: req.query.end_date
            }
        })
    }),
    transactionsController.getTransactionSummary
);

module.exports = router; 