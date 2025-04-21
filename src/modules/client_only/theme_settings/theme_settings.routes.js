const express = require("express");
const router = express.Router();
const themeSettingsController = require("./theme_settings.controller");
const { sdkAuth ,sdkUserAuth} = require("../../../middlewares/auth/sdk_auth");
const { createAuditMiddleware } = require("../../audit");

// Apply SDK authentication middleware
// router.use(sdkAuth);
// router.use(sdkUserAuth);

// Create audit middleware for theme settings
const auditMiddleware = createAuditMiddleware("theme_settings");

// Get theme settings
router.get(
    "/",
    auditMiddleware.captureResponse(),
    auditMiddleware.sdkAction("get_theme_settings", {
        description: "Get theme settings for SDK",
        targetModel: "ThemeSettings",
    }),
    themeSettingsController.getThemeSettings
);

module.exports = router; 