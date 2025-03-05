/**
 * Audit Integration Utilities
 * 
 * Helper functions to make it easier to integrate audit logging into other modules.
 */

const universalAudit = require('../middlewares/universal_audit.middleware');
const captureResponse = require('../middlewares/response_capture.middleware');

/**
 * Create audit middleware for a specific module
 * @param {string} moduleName - The name of the module
 * @returns {Object} - Object with middleware factories for different audit types
 */
const createAuditMiddleware = (moduleName) => {
    return {
        /**
         * Create middleware for auditing data access
         * @param {string} action - The action being performed
         * @param {Object} options - Additional options
         * @returns {Function} - Express middleware
         */
        dataAccess: (action, options = {}) => {
            return universalAudit({
                category: 'data_access',
                action: `${moduleName}.${action}`,
                description: options.description || `Access to ${moduleName} data`,
                targetModel: options.targetModel || moduleName,
                targetId: options.targetId,
                targetName: options.targetName,
                ...options
            });
        },

        /**
         * Create middleware for auditing data modifications
         * @param {string} action - The action being performed
         * @param {Object} options - Additional options
         * @returns {Function} - Express middleware
         */
        dataModification: (action, options = {}) => {
            return universalAudit({
                category: 'data_modification',
                action: `${moduleName}.${action}`,
                description: options.description || `Modification of ${moduleName} data`,
                targetModel: options.targetModel || moduleName,
                targetId: options.targetId,
                targetName: options.targetName,
                getOriginalData: options.getOriginalData,
                getModifiedData: options.getModifiedData,
                ...options
            });
        },

        /**
         * Create middleware for auditing admin actions
         * @param {string} action - The action being performed
         * @param {Object} options - Additional options
         * @returns {Function} - Express middleware
         */
        adminAction: (action, options = {}) => {
            return universalAudit({
                category: 'admin_action',
                action: `${moduleName}.${action}`,
                description: options.description || `Admin action on ${moduleName}`,
                targetModel: options.targetModel || moduleName,
                targetId: options.targetId,
                targetName: options.targetName,
                ...options
            });
        },

        /**
         * Create middleware for auditing point transactions
         * @param {string} action - The action being performed
         * @param {Object} options - Additional options
         * @returns {Function} - Express middleware
         */
        pointTransaction: (action, options = {}) => {
            return universalAudit({
                category: 'point_transaction',
                action: `${moduleName}.${action}`,
                description: options.description || `Point transaction in ${moduleName}`,
                targetModel: options.targetModel || 'Transaction',
                targetId: options.targetId,
                ...options
            });
        },

        /**
         * Create middleware for auditing authentication
         * @param {string} action - The action being performed
         * @param {Object} options - Additional options
         * @returns {Function} - Express middleware
         */
        authentication: (action, options = {}) => {
            return universalAudit({
                category: 'authentication',
                action: `${moduleName}.${action}`,
                description: options.description || `Authentication in ${moduleName}`,
                ...options
            });
        },

        /**
         * Create middleware for auditing API calls
         * @param {string} action - The action being performed
         * @param {Object} options - Additional options
         * @returns {Function} - Express middleware
         */
        api: (action, options = {}) => {
            return universalAudit({
                category: 'api',
                action: `${moduleName}.${action}`,
                description: options.description || `API call to ${moduleName}`,
                ...options
            });
        },

        /**
         * Middleware to capture response bodies for audit logging
         * @param {Object} options - Configuration options
         * @returns {Function} - Express middleware
         */
        captureResponse: (options = {}) => {
            return captureResponse(options);
        },
        /**
       * Create middleware for auditing SDK actions
       * @param {string} action - The action being performed
       * @param {Object} options - Additional options
       * @returns {Function} - Express middleware
       */
        sdkAction: (action, options = {}) => {
            return universalAudit({
                category: 'sdk_action',
                action: `${moduleName}.${action}`,
                description: options.description || `SDK action in ${moduleName}`,
                targetModel: options.targetModel || moduleName,
                targetId: options.targetId,
                details: options.details,
                getModifiedData: options.getModifiedData,
                ...options
            });
        }
    };
};

module.exports = {
    createAuditMiddleware
}; 