const auditRoutes = require('./routes/audit.routes');
const auditMiddleware = require('./middlewares/audit.middleware');
const universalAuditMiddleware = require('./middlewares/universal_audit.middleware');
const responseCaptureMiddleware = require('./middlewares/response_capture.middleware');
const AuditService = require('./services/audit.service');
const { createAuditMiddleware } = require('./utils/audit_integration');

module.exports = {
    auditRoutes,
    auditMiddleware,
    universalAudit: universalAuditMiddleware,
    captureResponse: responseCaptureMiddleware,
    createAuditMiddleware,
    AuditService
}; 