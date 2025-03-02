/**
 * Audit Configuration
 * Centralized configuration for audit logging
 */

const { NODE_ENV } = require('./env');

// Default TTL for audit logs in seconds (90 days)
const DEFAULT_TTL = 90 * 24 * 60 * 60; // 90 days in seconds

// Configuration for audit logging
const auditConfig = {
    // Enable/disable audit logging globally
    enabled: true,

    // Time-to-live for audit logs in seconds
    ttl: process.env.AUDIT_LOG_TTL || DEFAULT_TTL,

    // Categories to exclude from logging in development
    devExclusions: ['api', 'data_access'],

    // Whether to use background processing for audit logs
    useBackgroundProcessing: NODE_ENV === 'production',

    // Maximum size for before/after data in bytes
    maxDataSize: 100 * 1024, // 100KB

    // Fields to always exclude from logging (sensitive data)
    sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'creditCard'],

    // Default options for different audit types
    defaults: {
        api: {
            logRequestBody: false,
            logResponseBody: false
        },
        admin: {
            logRequestBody: true,
            logResponseBody: false
        },
        dataModification: {
            logBefore: true,
            logAfter: true
        }
    }
};

/**
 * Check if audit logging is enabled for a specific category
 * @param {string} category - The audit category
 * @returns {boolean} - Whether logging is enabled
 */
const isAuditEnabled = (category) => {
    if (!auditConfig.enabled) return false;

    // In development, exclude certain categories
    if (NODE_ENV === 'development' && auditConfig.devExclusions.includes(category)) {
        return false;
    }

    return true;
};

/**
 * Sanitize data for audit logging by removing sensitive fields
 * @param {Object} data - The data to sanitize
 * @returns {Object} - Sanitized data
 */
const sanitizeAuditData = (data) => {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };

    // Remove sensitive fields
    auditConfig.sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

module.exports = {
    auditConfig,
    isAuditEnabled,
    sanitizeAuditData
}; 