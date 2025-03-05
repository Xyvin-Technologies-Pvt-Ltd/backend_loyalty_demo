/**
 * Transaction Controller
 * Handles HTTP requests for transaction operations
 */

const transactionService = require('../services/transaction.service');
const { logger } = require('../../../middlewares/logger');

/**
 * Get all transactions
 * @route GET /api/v1/transactions
 * @access Private
 */
exports.getAllTransactions = async (req, res, next) => {
    try {
        const filters = req.query;
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'desc'
        };

        const result = await transactionService.getAllTransactions(filters, options);

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Error in getAllTransactions controller:', error);
        next(error);
    }
};

/**
 * Get transaction by ID
 * @route GET /api/v1/transactions/:id
 * @access Private
 */
exports.getTransactionById = async (req, res, next) => {
    try {
        const transaction = await transactionService.getTransactionById(req.params.id);

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        logger.error(`Error in getTransactionById controller for ID ${req.params.id}:`, error);
        next(error);
    }
};

/**
 * Create a new transaction
 * @route POST /api/v1/transactions
 * @access Private
 */
exports.createTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionService.createTransaction(req.body);

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        logger.error('Error in createTransaction controller:', error);
        next(error);
    }
};

/**
 * Update transaction status
 * @route PATCH /api/v1/transactions/:id/status
 * @access Private
 */
exports.updateTransactionStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const transaction = await transactionService.updateTransactionStatus(
            req.params.id,
            status,
            notes
        );

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        logger.error(`Error in updateTransactionStatus controller for ID ${req.params.id}:`, error);
        next(error);
    }
};

/**
 * Delete transaction
 * @route DELETE /api/v1/transactions/:id
 * @access Private
 */
exports.deleteTransaction = async (req, res, next) => {
    try {
        await transactionService.deleteTransaction(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        logger.error(`Error in deleteTransaction controller for ID ${req.params.id}:`, error);
        next(error);
    }
};

/**
 * Get user transactions
 * @route GET /api/v1/transactions/user/:userId
 * @access Private
 */
exports.getUserTransactions = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const filters = req.query;
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'desc'
        };

        const result = await transactionService.getUserTransactions(userId, filters, options);

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error(`Error in getUserTransactions controller for user ${req.params.userId}:`, error);
        next(error);
    }
}; 