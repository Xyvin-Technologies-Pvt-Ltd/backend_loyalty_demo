const express = require("express");
const router = express.Router();
const sdkAccessKeyController = require("../controllers/sdk_access_key.controller");
const { authorizePermission } = require("../../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../../audit");

// Create audit middleware for the sdk module
const sdkAudit = createAuditMiddleware("sdk");

// All routes require MANAGE_SETTINGS permission
router.use(authorizePermission("MANAGE_SETTINGS"));

// Generate a new SDK access key
router.post(
    "/",
    sdkAudit.captureResponse(),
    sdkAudit.adminAction("generate_key", {
        description: "Admin generated a new SDK access key",
        targetModel: "SDKAccessKey",
        details: req => req.body
    }),
    sdkAccessKeyController.createSDKKey 
);

// Get all SDK access keys
router.get(
    "/:app_id",
    sdkAudit.adminAction("view_all_keys", {
        description: "Admin viewed all SDK access keys",
        targetModel: "SDKAccessKey"
    }),
    sdkAccessKeyController.getSDKKey
);


// Create or Update an SDK access key
router.put(
    '/:id',
    sdkAudit.captureResponse(),
    sdkAudit.adminAction("update_key", {
        description: "Admin updated an SDK access key",
        targetModel: "SDKAccessKey",
        targetId: req => req.params.id,
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    sdkAccessKeyController.regenerateSDKKey
);

// Revoke an SDK access key
router.delete(
    "/:id",
    sdkAudit.captureResponse(),
    sdkAudit.adminAction("revoke_key", {
        description: "Admin revoked an SDK access key",
        targetModel: "SDKAccessKey",
        targetId: req => req.params.id
    }),
    sdkAccessKeyController.revokeSDKKey
);


module.exports = router; 