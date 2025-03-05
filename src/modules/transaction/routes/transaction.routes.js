/**
 * Transaction Routes
 * Defines API routes for transaction operations
 */

const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const { protect } = require("../../../middlewares/protect");
const { authorizePermission } = require("../../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../../audit");
const validate = require("../../../middlewares/validate");
const transactionValidator = require("../validators/transaction.validator");

// Create audit middleware for the transaction module
const transactionAudit = createAuditMiddleware("transaction");

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/transactions
 * @desc    Get all transactions
 * @access  Private (Admin)
 */
router.get(
    "/",
    authorizePermission("VIEW_TRANSACTIONS"),
    transactionAudit.dataAccess("list_transactions", {
        description: "User viewed transaction list",
        targetModel: "Transaction",
        details: req => ({
            filters: req.query
        })
    }),
    transactionController.getAllTransactions
);

/**
 * @route   POST /api/v1/transactions
 * @desc    Create a new transaction
 * @access  Private (Admin)
 */
router.post(
    "/",
    authorizePermission("MANAGE_TRANSACTIONS"),
    validate(transactionValidator.createTransaction),
    transactionAudit.captureResponse(),
    transactionAudit.adminAction("create_transaction", {
        description: "Admin created a transaction",
        targetModel: "Transaction",
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    transactionController.createTransaction
);

/**
 * @route   GET /api/v1/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private (Admin)
 */
router.get(
    "/:id",
    authorizePermission("VIEW_TRANSACTIONS"),
    transactionAudit.dataAccess("view_transaction", {
        description: "User viewed transaction details",
        targetModel: "Transaction",
        targetId: req => req.params.id
    }),
    transactionController.getTransactionById
);

/**
 * @route   PATCH /api/v1/transactions/:id/status
 * @desc    Update transaction status
 * @access  Private (Admin)
 */
router.patch(
    "/:id/status",
    authorizePermission("MANAGE_TRANSACTIONS"),
    validate(transactionValidator.updateTransactionStatus),
    transactionAudit.captureResponse(),
    transactionAudit.adminAction("update_transaction_status", {
        description: "Admin updated transaction status",
        targetModel: "Transaction",
        targetId: req => req.params.id,
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    transactionController.updateTransactionStatus
);

/**
 * @route   DELETE /api/v1/transactions/:id
 * @desc    Delete transaction
 * @access  Private (Admin)
 */
router.delete(
    "/:id",
    authorizePermission("MANAGE_TRANSACTIONS"),
    transactionAudit.adminAction("delete_transaction", {
        description: "Admin deleted a transaction",
        targetModel: "Transaction",
        targetId: req => req.params.id
    }),
    transactionController.deleteTransaction
);

/**
 * @route   GET /api/v1/transactions/user/:userId
 * @desc    Get user transactions
 * @access  Private (Admin or User)
 */
router.get(
    "/user/:userId",
    transactionAudit.dataAccess("view_user_transactions", {
        description: "User viewed their transactions",
        targetModel: "Transaction",
        details: req => ({
            userId: req.params.userId,
            filters: req.query
        })
    }),
    transactionController.getUserTransactions
);

module.exports = router; 