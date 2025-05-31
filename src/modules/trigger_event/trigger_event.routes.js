const express = require("express");
const router = express.Router();
const {
  createTriggerEvent,
  updateTriggerEvent,
  deleteTriggerEvent,
  getAllTriggerEvents,
  getTriggerEventById,
} = require("./trigger_event.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  enhancedCacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const {
  cacheMiddleware,
  cacheKeys,
  cachePatterns,
} = require("../../middlewares/redis_cache/cache.middleware");

const triggerEventAudit = createAuditMiddleware("trigger_event");

router.use(authorizePermission("MANAGE_SETTINGS"));

router.post(
  "/",
  triggerEventAudit.captureResponse(),
  triggerEventAudit.adminAction("create_trigger_event", {
    description: "Admin created a new trigger event",
    targetModel: "TriggerEvent",
    details: (req) => req.body,
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allTriggerEvents }, // Clear all trigger events cache (all query variations)
    cacheKeys.triggerEventById,
    cacheKeys.triggerServiceByEventId
  ),
  createTriggerEvent
);
router.put(
  "/:id",
  triggerEventAudit.captureResponse(),
  triggerEventAudit.adminAction("update_trigger_event", {
    description: "Admin updated a trigger event",
    targetModel: "TriggerEvent",
    details: (req) => req.body,
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allTriggerEvents }, // Clear all trigger events cache (all query variations)
    cacheKeys.triggerEventById,
    cacheKeys.triggerServiceByEventId
  ),
  updateTriggerEvent
);
router.delete(
  "/:id",
  triggerEventAudit.captureResponse(),
  triggerEventAudit.adminAction("delete_trigger_event", {
    description: "Admin deleted a trigger event",
    targetModel: "TriggerEvent",
    details: (req) => req.body,
  }),
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allTriggerEvents }, // Clear all trigger events cache (all query variations)
    cacheKeys.triggerEventById,
    cacheKeys.triggerServiceByEventId
  ),
  deleteTriggerEvent
);

router.get(
  "/",
  triggerEventAudit.adminAction("view_all_trigger_events", {
    description: "Admin viewed all trigger events",
    targetModel: "TriggerEvent",
    details: (req) => req.body,
  }),
  cacheMiddleware(60, cacheKeys.allTriggerEvents),
  getAllTriggerEvents
);
router.get(
  "/:id",
  triggerEventAudit.adminAction("view_trigger_event", {
    description: "Admin viewed a trigger event",
    targetModel: "TriggerEvent",
    details: (req) => req.body,
  }),
  cacheMiddleware(60, cacheKeys.triggerEventById),
  getTriggerEventById
);
module.exports = router;
