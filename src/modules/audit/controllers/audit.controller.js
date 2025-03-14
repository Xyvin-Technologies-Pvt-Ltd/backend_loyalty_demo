const AuditService = require("../services/audit.service");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");
const AuditLog = require("../../../models/audit_log_model"); 

/**
 * Get audit logs with filtering and pagination
 */
exports.getLogs = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            action: req.query.action,
            status: req.query.status,
            user: req.query.user,
            userModel: req.query.userModel,
            targetId: req.query.targetId,
            targetModel: req.query.targetModel,
            requestId: req.query.requestId,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            search: req.query.search,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || "timestamp",
            sortOrder: req.query.sortOrder || "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        return response_handler(res, 200, "Audit logs retrieved successfully", result);
    } catch (error) {
        logger.error(`Error retrieving audit logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get audit log by ID
 */
exports.getLogById = async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id);

        if (!log) {
            return response_handler(res, 404, "Audit log not found");
        }

        return response_handler(res, 200, "Audit log retrieved successfully", log);
    } catch (error) {
        logger.error(`Error retrieving audit log: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get audit logs for a specific user
 */
exports.getUserLogs = async (req, res) => {
    try {
        const filters = {
            user: req.params.userId,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            category: req.query.category,
            action: req.query.action,
            status: req.query.status,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || "timestamp",
            sortOrder: req.query.sortOrder || "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        return response_handler(res, 200, "User audit logs retrieved successfully", result);
    } catch (error) {
        logger.error(`Error retrieving user audit logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get point transaction logs
 */
exports.getPointTransactionLogs = async (req, res) => {
    try {
        const filters = {
            category: "point_transaction",
            user: req.query.userId,
            transactionType: req.query.transactionType,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || "timestamp",
            sortOrder: req.query.sortOrder || "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        return response_handler(res, 200, "Point transaction logs retrieved successfully", result);
    } catch (error) {
        logger.error(`Error retrieving point transaction logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get admin action logs
 */
exports.getAdminActionLogs = async (req, res) => {
    try {
        const filters = {
            category: "admin_action",
            user: req.query.adminId,
            action: req.query.action,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || "timestamp",
            sortOrder: req.query.sortOrder || "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        return response_handler(res, 200, "Admin action logs retrieved successfully", result);
    } catch (error) {
        logger.error(`Error retrieving admin action logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get system logs
 */
exports.getSystemLogs = async (req, res) => {
    try {
        const filters = {
            category: "system_event",
            action: req.query.action,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || "timestamp",
            sortOrder: req.query.sortOrder || "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        return response_handler(res, 200, "System logs retrieved successfully", result);
    } catch (error) {
        logger.error(`Error retrieving system logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get API logs
 */
exports.getApiLogs = async (req, res) => {
    try {
        const filters = {
            category: "api",
            endpoint: req.query.endpoint,
            method: req.query.method,
            responseStatus: req.query.responseStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || "timestamp",
            sortOrder: req.query.sortOrder || "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        return response_handler(res, 200, "API logs retrieved successfully", result);
    } catch (error) {
        logger.error(`Error retrieving API logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get audit statistics
 */
exports.getStatistics = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const statistics = await AuditService.getStatistics(filters);

        return response_handler(res, 200, "Audit statistics retrieved successfully", statistics);
    } catch (error) {
        logger.error(`Error retrieving audit statistics: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Export audit logs
 */
exports.exportLogs = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            action: req.query.action,
            status: req.query.status,
            user: req.query.user,
            userModel: req.query.userModel,
            targetId: req.query.targetId,
            targetModel: req.query.targetModel,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        // Set a higher limit for exports
        const options = {
            limit: 1000,
            sortBy: "timestamp",
            sortOrder: "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        // Log the export action
        AuditService.logAdminAction({
            action: "export_audit_logs",
            user: req.admin._id,
            userModel: "Admin",
            userName: req.admin.name,
            userEmail: req.admin.email,
            description: "Exported audit logs",
            details: { filters },
        });

        return response_handler(res, 200, "Audit logs exported successfully", result.logs);
    } catch (error) {
        logger.error(`Error exporting audit logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 



/**
 * Get sdk-api logs
 */
exports.getSdkApiLogs = async (req, res) => {
    try {
        const filters = {
            category: "sdk_action",
            action: req.query.action,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || "timestamp",
            sortOrder: req.query.sortOrder || "desc",
        };

        const result = await AuditService.queryLogs(filters, options);

        return response_handler(res, 200, "Sdk-api logs retrieved successfully", result);
    } catch (error) {
        logger.error(`Error retrieving sdk-api logs: ${error.message}`, {
            stack: error.stack,
        });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};