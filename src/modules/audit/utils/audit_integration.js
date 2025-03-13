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

        
        authentication: (action, options = {}) => {
            return universalAudit({
                category: 'authentication',
                action: `${moduleName}.${action}`,
                description: options.description || `Authentication in ${moduleName}`,
                ...options
            });
        },

      
        api: (action, options = {}) => {
            return universalAudit({
                category: 'api',
                action: `${moduleName}.${action}`,
                description: options.description || `API call to ${moduleName}`,
                ...options
            });
        },

       
        captureResponse: (options = {}) => {
            return captureResponse(options);
        },
      
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