const AuditService = require("../services/audit.service");
const { v4: uuidv4 } = require("uuid");

/**
 * Middleware to log API requests
 */
const auditApiRequest = (options = {}) => {
    return async (req, res, next) => {
        // Generate a unique request ID for correlation
        const requestId = uuidv4();
        req.requestId = requestId;

        // Store the start time to calculate response time
        const startTime = Date.now();

        // Capture the original end method to intercept it
        const originalEnd = res.end;

        // Override the end method to capture response data
        res.end = function (chunk, encoding) {
            // Calculate response time
            const responseTime = Date.now() - startTime;

            // Get user info if available
            const user = req.user || req.admin || req.sdkUser;
            const userModel = req.user ? "User" : (req.admin ? "Admin" : null);

            // Determine action based on route or override
            const action = options.action || `${req.method} ${req.originalUrl.split("?")[0]}`;

            // Log the API request
            AuditService.logApiCall({
                action,
                status: res.statusCode >= 400 ? "failure" : "success",
                user: user ? user._id : null,
                userModel,
                userName: user ? user.name : null,
                userEmail: user ? user.email : null,
                ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                userAgent: req.headers["user-agent"],
                requestId,
                description: options.description || `API request to ${req.originalUrl}`,
                details: {
                    query: req.query,
                    params: req.params,
                    body: options.logRequestBody ? req.body : undefined,
                },
                endpoint: req.originalUrl,
                method: req.method,
                responseTime,
                responseStatus: res.statusCode,
            }).catch(err => console.error("Error logging API request:", err));

            // Call the original end method
            originalEnd.apply(res, arguments);
        };

        next();
    };
};

/**
 * Middleware to log authentication events
 */
const auditAuthentication = (action, options = {}) => {
    return async (req, res, next) => {
        // Store the original end method to intercept it
        const originalEnd = res.end;

        // Override the end method to capture response data
        res.end = function (chunk, encoding) {
            // Get user info if available
            const user = req.user || req.admin;
            const userModel = req.user ? "User" : (req.admin ? "Admin" : null);

            // Determine status based on response code
            const status = res.statusCode >= 400 ? "failure" : "success";

            // Log the authentication event
            AuditService.logAuthentication({
                action,
                status,
                user: user ? user._id : null,
                userModel,
                userName: user ? user.name : null,
                userEmail: user ? user.email : null,
                ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                userAgent: req.headers["user-agent"],
                requestId: req.requestId || uuidv4(),
                description: options.description || `Authentication ${action}`,
                details: options.logRequestBody ? req.body : undefined,
                sessionId: req.session ? req.session.id : null,
                authMethod: options.authMethod || "password",
            }).catch(err => console.error("Error logging authentication:", err));

            // Call the original end method
            originalEnd.apply(res, arguments);
        };

        next();
    };
};

/**
 * Middleware to log admin actions
 */
const auditAdminAction = (action, options = {}) => {
    return async (req, res, next) => {
        // Store the original end method to intercept it
        const originalEnd = res.end;

        // Override the end method to capture response data
        res.end = function (chunk, encoding) {
            // Only proceed if admin is authenticated
            if (!req.admin) {
                originalEnd.apply(res, arguments);
                return;
            }

            // Determine status based on response code
            const status = res.statusCode >= 400 ? "failure" : "success";

            // Determine target information
            let targetId = null;
            let targetModel = null;
            let targetName = null;

            if (options.targetId) {
                targetId = typeof options.targetId === 'function'
                    ? options.targetId(req)
                    : options.targetId;
            } else if (req.params.id) {
                targetId = req.params.id;
            }

            if (options.targetModel) {
                targetModel = options.targetModel;
            }

            if (options.targetName) {
                targetName = typeof options.targetName === 'function'
                    ? options.targetName(req)
                    : options.targetName;
            }

            // Log the admin action
            AuditService.logAdminAction({
                action,
                status,
                user: req.admin._id,
                userModel: "Admin",
                userName: req.admin.name,
                userEmail: req.admin.email,
                ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                userAgent: req.headers["user-agent"],
                requestId: req.requestId || uuidv4(),
                targetId,
                targetModel,
                targetName,
                description: options.description || `Admin action: ${action}`,
                details: options.logRequestBody ? req.body : undefined,
            }).catch(err => console.error("Error logging admin action:", err));

            // Call the original end method
            originalEnd.apply(res, arguments);
        };

        next();
    };
};

/**
 * Middleware to log data modifications
 */
const auditDataModification = (action, options = {}) => {
    return async (req, res, next) => {
        // Capture the original data if available
        let originalData = null;

        if (options.getOriginalData && typeof options.getOriginalData === 'function') {
            try {
                originalData = await options.getOriginalData(req);
            } catch (error) {
                console.error("Error getting original data for audit:", error);
            }
        }

        // Store the original end method to intercept it
        const originalEnd = res.end;

        // Override the end method to capture response data
        res.end = function (chunk, encoding) {
            // Get user info if available
            const user = req.user || req.admin;
            const userModel = req.user ? "User" : (req.admin ? "Admin" : null);

            // Determine status based on response code
            const status = res.statusCode >= 400 ? "failure" : "success";

            // Get modified data if available
            let modifiedData = null;
            if (options.getModifiedData && typeof options.getModifiedData === 'function') {
                try {
                    // For successful responses only
                    if (status === "success") {
                        modifiedData = options.getModifiedData(req, res);
                    }
                } catch (error) {
                    console.error("Error getting modified data for audit:", error);
                }
            }

            // Determine target information
            let targetId = null;
            let targetModel = null;
            let targetName = null;

            if (options.targetId) {
                targetId = typeof options.targetId === 'function'
                    ? options.targetId(req)
                    : options.targetId;
            } else if (req.params.id) {
                targetId = req.params.id;
            }

            if (options.targetModel) {
                targetModel = options.targetModel;
            }

            if (options.targetName) {
                targetName = typeof options.targetName === 'function'
                    ? options.targetName(req)
                    : options.targetName;
            }

            // Log the data modification
            AuditService.logDataModification({
                action,
                status,
                user: user ? user._id : null,
                userModel,
                userName: user ? user.name : null,
                userEmail: user ? user.email : null,
                ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                userAgent: req.headers["user-agent"],
                requestId: req.requestId || uuidv4(),
                targetId,
                targetModel,
                targetName,
                description: options.description || `Data modification: ${action}`,
                details: options.logRequestBody ? req.body : undefined,
                before: originalData,
                after: modifiedData,
            }).catch(err => console.error("Error logging data modification:", err));

            // Call the original end method
            originalEnd.apply(res, arguments);
        };

        next();
    };
};

module.exports = {
    auditApiRequest,
    auditAuthentication,
    auditAdminAction,
    auditDataModification,
}; 