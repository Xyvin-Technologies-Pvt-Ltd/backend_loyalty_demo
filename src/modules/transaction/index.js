/**
 * Transaction Module
 * Exports all transaction module components
 */

const transactionRoutes = require('./routes/transaction.routes');
const transactionController = require('./controllers/transaction.controller');
const transactionService = require('./services/transaction.service');
const transactionValidator = require('./validators/transaction.validator');

module.exports = {
    routes: transactionRoutes,
    controller: transactionController,
    service: transactionService,
    validator: transactionValidator
}; 