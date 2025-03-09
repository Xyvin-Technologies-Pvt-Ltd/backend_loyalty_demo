const express = require("express");
const router = express.Router();
const {
  createSegment,
  getAllSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
  getSegmentCustomers,
  refreshSegment,
} = require("./segment.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for segmentation
const segmentAudit = createAuditMiddleware("customer_segment");

// Routes that require MANAGE_SEGMENTS permission
router.get(
  "/",
  authorizePermission("MANAGE_SEGMENTS"),
  segmentAudit.captureResponse(),
  segmentAudit.adminAction("view_segments", {
    description: "Admin viewed all customer segments",
    targetModel: "CustomerSegment",
  }),
  getAllSegments
);

router.get(
  "/:id",
  authorizePermission("MANAGE_SEGMENTS"),
  segmentAudit.captureResponse(),
  segmentAudit.adminAction("view_segment", {
    description: "Admin viewed a customer segment",
    targetModel: "CustomerSegment",
  }),
  getSegmentById
);

router.post(
  "/",
  authorizePermission("MANAGE_SEGMENTS"),
  segmentAudit.captureResponse(),
  segmentAudit.adminAction("create_segment", {
    description: "Admin created a new customer segment",
    targetModel: "CustomerSegment",
  }),
  createSegment
);

router.put(
  "/:id",
  authorizePermission("MANAGE_SEGMENTS"),
  segmentAudit.captureResponse(),
  segmentAudit.adminAction("update_segment", {
    description: "Admin updated a customer segment",
    targetModel: "CustomerSegment",
  }),
  updateSegment
);

router.delete(
  "/:id",
  authorizePermission("MANAGE_SEGMENTS"),
  segmentAudit.captureResponse(),
  segmentAudit.adminAction("delete_segment", {
    description: "Admin deleted a customer segment",
    targetModel: "CustomerSegment",
  }),
  deleteSegment
);

router.get(
  "/:id/customers",
  authorizePermission("MANAGE_SEGMENTS"),
  segmentAudit.captureResponse(),
  segmentAudit.adminAction("view_segment_customers", {
    description: "Admin viewed customers in a segment",
    targetModel: "CustomerSegment",
  }),
  getSegmentCustomers
);

router.post(
  "/:id/refresh",
  authorizePermission("MANAGE_SEGMENTS"),
  segmentAudit.captureResponse(),
  segmentAudit.adminAction("refresh_segment", {
    description: "Admin refreshed a customer segment",
    targetModel: "CustomerSegment",
  }),
  refreshSegment
);

module.exports = router;
