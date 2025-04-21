const express = require("express");
const router = express.Router();
const transactionsController = require("./transactions.controller");
const { sdkAuth ,sdkUserAuth} = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
// router.use(sdkAuth());
// router.use(sdkUserAuth);

// Create audit middleware for transactions
const SdkTransactionAudit = createAuditMiddleware("transaction");

// Get all transactions for the authenticated customer
router.get(
    "/",
    SdkTransactionAudit.captureResponse(),
    SdkTransactionAudit.sdkAction("get_customer_transactions", {
        description: "Customer retrieved their transactions",
        targetModel: "Transaction",
        details: (req) => ({
            filters: req.query
        })
    }),
    transactionsController.getMyTransactions
);

// Get specific transaction
router.get(
    "/:transaction_id",
    SdkTransactionAudit.captureResponse(),
    SdkTransactionAudit.sdkAction("get_transaction_details", {
        description: "Customer retrieved transaction details",
        targetModel: "Transaction",
        details: (req) => ({
            transaction_id: req.params.transaction_id
        })
    }),
    transactionsController.getTransactionById
);

// Get transaction summary
router.get(
    "/summary",
    SdkTransactionAudit.captureResponse(),
    SdkTransactionAudit.sdkAction("get_transaction_summary", {
        description: "Customer retrieved transaction summary",
        targetModel: "Transaction",
        details: (req) => ({
            date_range: {
                start_date: req.query.start_date,
                end_date: req.query.end_date
            }
        })
    }),
    transactionsController.getTransactionSummary
);

module.exports = router; 