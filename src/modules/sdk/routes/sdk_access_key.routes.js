const express = require("express");
const router = express.Router();
const sdkAccessKeyController = require("../controllers/sdk_access_key.controller");
const { authorize } = require("../../../middlewares/auth");
const { createAuditMiddleware } = require("../../audit");

// Create audit middleware for the sdk module
const sdkAudit = createAuditMiddleware("sdk");

// All routes require MANAGE_SETTINGS permission
router.use(authorize("MANAGE_SETTINGS"));

// Generate a new SDK access key
router.post(
    "/",
    sdkAudit.captureResponse(),
    sdkAudit.adminAction("generate_key", {
        description: "Admin generated a new SDK access key",
        targetModel: "SDKAccessKey",
        details: req => req.body
    }),
    sdkAccessKeyController.generateKey
);

// Get all SDK access keys
router.get(
    "/",
    sdkAudit.adminAction("view_all_keys", {
        description: "Admin viewed all SDK access keys",
        targetModel: "SDKAccessKey"
    }),
    sdkAccessKeyController.getAllKeys
);

// Get a single SDK access key by ID
router.get(
    "/:id",
    sdkAudit.adminAction("view_key", {
        description: "Admin viewed an SDK access key",
        targetModel: "SDKAccessKey",
        targetId: req => req.params.id
    }),
    sdkAccessKeyController.getKeyById
);

// Update an SDK access key
router.put(
    "/:id",
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
    sdkAccessKeyController.updateKey
);

// Revoke an SDK access key
router.patch(
    "/:id/revoke",
    sdkAudit.captureResponse(),
    sdkAudit.adminAction("revoke_key", {
        description: "Admin revoked an SDK access key",
        targetModel: "SDKAccessKey",
        targetId: req => req.params.id
    }),
    sdkAccessKeyController.revokeKey
);

// Regenerate an SDK access key
router.post(
    "/:id/regenerate",
    sdkAudit.captureResponse(),
    sdkAudit.adminAction("regenerate_key", {
        description: "Admin regenerated an SDK access key",
        targetModel: "SDKAccessKey",
        targetId: req => req.params.id
    }),
    sdkAccessKeyController.regenerateKey
);

module.exports = router; 