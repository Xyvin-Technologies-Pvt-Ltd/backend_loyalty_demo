/**
 * Transaction Service
 * Contains business logic for transaction operations
 */

const Transaction = require('../../../models/transaction_model');
const User = require('../../../models/user_model');
const { logger } = require('../../../middlewares/logger');

class TransactionService {
    /**
     * Get all transactions with optional filtering
     * @param {Object} filters - Query filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Array>} List of transactions
     */
    async getAllTransactions(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const skip = (page - 1) * limit;
            const sortDirection = sortOrder === 'desc' ? -1 : 1;

            const query = this._buildTransactionQuery(filters);

            const transactions = await Transaction.find(query)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email')
                .lean();

            const total = await Transaction.countDocuments(query);

            return {
                data: transactions,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error in getAllTransactions service:', error);
            throw error;
        }
    }

    /**
     * Get transaction by ID
     * @param {string} id - Transaction ID
     * @returns {Promise<Object>} Transaction object
     */
    async getTransactionById(id) {
        try {
            const transaction = await Transaction.findById(id)
                .populate('user', 'name email')
                .lean();

            if (!transaction) {
                const error = new Error('Transaction not found');
                error.statusCode = 404;
                throw error;
            }

            return transaction;
        } catch (error) {
            logger.error(`Error in getTransactionById service for ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new transaction
     * @param {Object} transactionData - Transaction data
     * @returns {Promise<Object>} Created transaction
     */
    async createTransaction(transactionData) {
        try {
            // Validate user exists
            const userExists = await User.exists({ _id: transactionData.user });
            if (!userExists) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            // Create transaction
            const transaction = new Transaction(transactionData);
            await transaction.save();

            // Update user points if needed
            if (transactionData.type === 'EARN') {
                await User.findByIdAndUpdate(
                    transactionData.user,
                    { $inc: { points: transactionData.amount } }
                );
            } else if (transactionData.type === 'REDEEM') {
                await User.findByIdAndUpdate(
                    transactionData.user,
                    { $inc: { points: -transactionData.amount } }
                );
            }

            return transaction;
        } catch (error) {
            logger.error('Error in createTransaction service:', error);
            throw error;
        }
    }

    /**
     * Update transaction status
     * @param {string} id - Transaction ID
     * @param {string} status - New status
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>} Updated transaction
     */
    async updateTransactionStatus(id, status, notes) {
        try {
            const transaction = await Transaction.findById(id);

            if (!transaction) {
                const error = new Error('Transaction not found');
                error.statusCode = 404;
                throw error;
            }

            // Handle point adjustments if status changes
            if (transaction.status !== status) {
                if (status === 'CANCELLED' && transaction.status === 'COMPLETED') {
                    // Reverse the points effect
                    const pointsChange = transaction.type === 'EARN' ? -transaction.amount : transaction.amount;
                    await User.findByIdAndUpdate(
                        transaction.user,
                        { $inc: { points: pointsChange } }
                    );
                } else if (status === 'COMPLETED' && transaction.status === 'PENDING') {
                    // Apply the points effect
                    const pointsChange = transaction.type === 'EARN' ? transaction.amount : -transaction.amount;
                    await User.findByIdAndUpdate(
                        transaction.user,
                        { $inc: { points: pointsChange } }
                    );
                }
            }

            // Update transaction
            transaction.status = status;
            if (notes) {
                transaction.notes = notes;
            }

            await transaction.save();
            return transaction;
        } catch (error) {
            logger.error(`Error in updateTransactionStatus service for ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete transaction (soft delete)
     * @param {string} id - Transaction ID
     * @returns {Promise<Object>} Deleted transaction
     */
    async deleteTransaction(id) {
        try {
            const transaction = await Transaction.findByIdAndUpdate(
                id,
                { isDeleted: true },
                { new: true }
            );

            if (!transaction) {
                const error = new Error('Transaction not found');
                error.statusCode = 404;
                throw error;
            }

            return transaction;
        } catch (error) {
            logger.error(`Error in deleteTransaction service for ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get user transactions
     * @param {string} userId - User ID
     * @param {Object} filters - Query filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Array>} List of user transactions
     */
    async getUserTransactions(userId, filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const skip = (page - 1) * limit;
            const sortDirection = sortOrder === 'desc' ? -1 : 1;

            const query = {
                user: userId,
                ...this._buildTransactionQuery(filters)
            };

            const transactions = await Transaction.find(query)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Transaction.countDocuments(query);

            return {
                data: transactions,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error(`Error in getUserTransactions service for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Build transaction query from filters
     * @private
     * @param {Object} filters - Query filters
     * @returns {Object} MongoDB query object
     */
    _buildTransactionQuery(filters) {
        const query = { isDeleted: { $ne: true } };

        if (filters.user) {
            query.user = filters.user;
        }

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.minAmount) {
            query.amount = { ...query.amount, $gte: Number(filters.minAmount) };
        }

        if (filters.maxAmount) {
            query.amount = { ...query.amount, $lte: Number(filters.maxAmount) };
        }

        if (filters.startDate) {
            query.createdAt = { ...query.createdAt, $gte: new Date(filters.startDate) };
        }

        if (filters.endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
        }

        return query;
    }
}

module.exports = new TransactionService(); 