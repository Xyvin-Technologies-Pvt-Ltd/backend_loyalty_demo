/**
 * Universal Audit Middleware
 * 
 * A flexible middleware that can be used to audit any route with minimal configuration.
 * This middleware automatically detects the user type, extracts relevant information,
 * and logs the appropriate audit event.
 */

const AuditService = require("../services/audit.service");
const { v4: uuidv4 } = require("uuid");
const { auditConfig } = require("../../../config/audit");

/**
 * Get user information from the request
 * @param {Object} req - Express request object
 * @returns {Object} User information
 */
const getUserInfo = (req) => {
    // Determine user type (regular user, admin, or SDK client)
    const user = req.user || req.admin || req.sdkClient;

    if (!user) return { user: null, userModel: null, userName: null, userEmail: null };

    const userModel = req.user ? "User" : (req.admin ? "Admin" : "SDKAccessKey");
    const userName = user.name || user.username || user.clientName || null;
    const userEmail = user.email || null;

    return {
        user: user._id,
        userModel,
        userName,
        userEmail
    };
};

/**
 * Get request information
 * @param {Object} req - Express request object
 * @returns {Object} Request information
 */
const getRequestInfo = (req) => {
    return {
        ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        requestId: req.requestId || uuidv4(),
        method: req.method,
        endpoint: req.originalUrl
    };
};

/**
 * Universal audit middleware factory
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const auditRoute = (options = {}) => {
    // Default options
    const config = {
        // Audit category (required)
        category: options.category || "api",

        // Action name (defaults to HTTP method + path)
        action: options.action,

        // Description of the action
        description: options.description,

        // Target information
        targetModel: options.targetModel,
        targetId: options.targetId,
        targetName: options.targetName,

        // Data capture functions
        getOriginalData: options.getOriginalData,
        getModifiedData: options.getModifiedData,

        // Additional details
        details: options.details,

        // Whether to log request body
        logRequestBody: options.logRequestBody ||
            auditConfig.defaults[options.category || "api"].logRequestBody,

        // Whether to log response body
        logResponseBody: options.logResponseBody ||
            auditConfig.defaults[options.category || "api"].logResponseBody
    };

    return async (req, res, next) => {
        // Generate and attach request ID if not present
        if (!req.requestId) {
            req.requestId = uuidv4();
        }

        // Store original data if needed
        let originalData = null;
        if (config.getOriginalData && typeof config.getOriginalData === 'function') {
            try {
                originalData = await config.getOriginalData(req);
            } catch (error) {
                console.error("Error getting original data for audit:", error);
            }
        }

        // Store the start time to calculate response time
        const startTime = Date.now();

        // Capture the original end method to intercept it
        const originalEnd = res.end;

        // Override the end method to capture response data
        res.end = async function (chunk, encoding) {
            // Calculate response time
            const responseTime = Date.now() - startTime;

            // Get user info
            const userInfo = getUserInfo(req);

            // Get request info
            const requestInfo = getRequestInfo(req);

            // Determine action based on route or override
            const action = config.action || `${req.method} ${req.path.split("?")[0]}`;

            // Determine status based on response code
            const status = res.statusCode >= 400 ? "failure" : "success";

            // Get modified data if needed
            let modifiedData = null;
            if (config.getModifiedData && typeof config.getModifiedData === 'function') {
                try {
                    modifiedData = await config.getModifiedData(req, res);
                } catch (error) {
                    console.error("Error getting modified data for audit:", error);
                }
            }

            // Get target information
            const targetId = typeof config.targetId === 'function'
                ? config.targetId(req)
                : (config.targetId || req.params.id);

            const targetName = typeof config.targetName === 'function'
                ? config.targetName(req)
                : config.targetName;

            // Get additional details
            const details = typeof config.details === 'function'
                ? config.details(req, res)
                : (config.details || {});

            // Add request body if configured
            if (config.logRequestBody) {
                details.requestBody = req.body;
            }

            // Add response body if configured and available
            if (config.logResponseBody && res.locals.responseBody) {
                details.responseBody = res.locals.responseBody;
            }

            // Create the audit log based on category
            switch (config.category) {
                case "authentication":
                    await AuditService.logAuthentication({
                        action,
                        status,
                        ...userInfo,
                        ...requestInfo,
                        description: config.description || `Authentication ${action}`,
                        details,
                        sessionId: req.session ? req.session.id : null,
                        authMethod: config.authMethod || "password",
                    });
                    break;

                case "data_access":
                    await AuditService.logDataAccess({
                        action,
                        status,
                        ...userInfo,
                        ...requestInfo,
                        targetId,
                        targetModel: config.targetModel,
                        targetName,
                        description: config.description || `Data access: ${action}`,
                        details,
                    });
                    break;

                case "admin_action":
                    await AuditService.logAdminAction({
                        action,
                        status,
                        ...userInfo,
                        ...requestInfo,
                        targetId,
                        targetModel: config.targetModel,
                        targetName,
                        description: config.description || `Admin action: ${action}`,
                        details,
                    });
                    break;

                case "data_modification":
                    await AuditService.logDataModification({
                        action,
                        status,
                        ...userInfo,
                        ...requestInfo,
                        targetId,
                        targetModel: config.targetModel,
                        targetName,
                        description: config.description || `Data modification: ${action}`,
                        details,
                        before: originalData,
                        after: modifiedData,
                    });
                    break;

                case "point_transaction":
                    await AuditService.logPointTransaction({
                        action,
                        status,
                        ...userInfo,
                        ...requestInfo,
                        targetId,
                        targetModel: config.targetModel || "Transaction",
                        description: config.description || `Point transaction: ${action}`,
                        details,
                        points: details.points,
                        transactionType: details.transactionType,
                    });
                    break;

                case "api":
                default:
                    await AuditService.logApiCall({
                        action,
                        status,
                        ...userInfo,
                        ...requestInfo,
                        description: config.description || `API call: ${action}`,
                        details,
                        endpoint: requestInfo.endpoint,
                        method: requestInfo.method,
                        responseTime,
                        responseStatus: res.statusCode,
                    });
                    break;
            }

            // Call the original end method
            originalEnd.apply(res, arguments);
        };

        next();
    };
};

module.exports = auditRoute; 