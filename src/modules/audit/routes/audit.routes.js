const express = require("express");
const router = express.Router();
const auditController = require("../controllers/audit.controller");
const { authorizePermission } = require("../../../middlewares/auth/auth");
const { auditAdminAction } = require("../middlewares/audit.middleware");

// All routes require authentication and VIEW_AUDIT_LOGS permission
router.use(authorizePermission("VIEW_AUDIT_LOGS"));

// Reports and statistics
router.get(
    "/reports/statistics",
    auditAdminAction("view_audit_statistics"),
    auditController.getStatistics
);

router.get(
    "/reports/export",
    authorizePermission("EXPORT_AUDIT_LOGS"),
    auditAdminAction("export_audit_logs"),
    auditController.exportLogs
);

// Point transactions logs
router.get(
    "/point-transactions",
    auditAdminAction("view_point_transaction_logs"),
    auditController.getPointTransactionLogs
);

// Admin actions logs
router.get(
    "/admin-actions",
    auditAdminAction("view_admin_action_logs"),
    auditController.getAdminActionLogs
);

// System logs
router.get(
    "/system-logs",
    authorizePermission("VIEW_SYSTEM_LOGS"),
    auditAdminAction("view_system_logs"),
    auditController.getSystemLogs
);

// API logs
router.get(
    "/api-logs",
    authorizePermission("VIEW_API_LOGS"),
    auditAdminAction("view_api_logs"),
    auditController.getApiLogs
);

// General logs with filtering
router.get(
    "/logs",
    auditAdminAction("view_audit_logs"),
    auditController.getLogs
);

// Get log by ID
router.get(
    "/logs/:id",
    auditAdminAction("view_audit_log_detail"),
    auditController.getLogById
);

// Get logs for a specific user
router.get(
    "/users/:userId/logs",
    auditAdminAction("view_user_audit_logs"),
    auditController.getUserLogs
);

// Get sdk-api logs
router.get(
    "/sdk-api-logs",
    auditAdminAction("view_sdk_api_logs"),
    auditController.getSdkApiLogs
);

//get authentication logs
router.get(
    "/authentication-logs",
    auditAdminAction("view_authentication_logs"),
    auditController.getAuthenticationLogs
);

module.exports = router; 