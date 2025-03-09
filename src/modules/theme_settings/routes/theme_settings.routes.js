const express = require("express");
const router = express.Router();
const themeSettingsController = require("../controllers/theme_settings.controller");
const { authorizePermission } = require("../../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../../audit");
const { cacheInvalidationMiddleware } = require("../../../middlewares/redis_cache/cache_invalidation.middleware");
const { cacheMiddleware, cacheKeys } = require("../../../middlewares/redis_cache/cache.middleware");

// Create audit middleware for the theme_settings module
const themeAudit = createAuditMiddleware("theme_settings");

// All routes require authentication and MANAGE_SETTINGS permission
router.use(authorizePermission("MANAGE_SETTINGS"));

// Get theme settings
router.get(
  "/",
  themeAudit.adminAction("view_theme_settings", {
    description: "Admin viewed theme settings",
    targetModel: "ThemeSettings",
  }),
  cacheMiddleware(3600, cacheKeys.allThemeSettings), 
  themeSettingsController.getThemeSettings
);

// Update theme settings
router.put(
  "/",
  themeAudit.captureResponse(),
  themeAudit.adminAction("update_theme_settings", {
    targetModel: "ThemeSettings",
    description: "Admin updated theme settings",
    details: (req) => req.body,
    getOriginalData: async () => {
      const settings = await require("../../../models/theme_settings_model")
        .findOne()
        .sort({ createdAt: -1 });
      return settings ? settings.toObject() : null;
    },
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
    cacheInvalidationMiddleware(cacheKeys.allThemeSettings),
  themeSettingsController.updateThemeSettings
);

// Reset theme settings to defaults
router.post(
  "/reset",
  themeAudit.captureResponse(),
  themeAudit.adminAction("reset_theme_settings", {
    targetModel: "ThemeSettings",
    description: "Admin reset theme settings to defaults",
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  cacheInvalidationMiddleware(cacheKeys.allThemeSettings),
  themeSettingsController.resetThemeSettings
);

// Apply a color preset
router.post(
  "/apply-color-preset/:presetName",
  themeAudit.captureResponse(),
  themeAudit.adminAction("apply_theme_preset", {
    targetModel: "ThemeSettings",
    description: (req) => `Admin applied ${req.params.presetName} theme preset`,
    details: (req) => ({ presetName: req.params.presetName }),
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  cacheInvalidationMiddleware(cacheKeys.allThemeSettings),
  themeSettingsController.applyPreset
);

module.exports = router;
