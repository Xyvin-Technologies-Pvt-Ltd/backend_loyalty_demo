const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerDashboard,
} = require("./customer.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  cacheMiddleware,
  cacheKeys,
} = require("../../middlewares/redis_cache/cache.middleware");

// Create audit middleware for customers
const customerAudit = createAuditMiddleware("customer");

// Routes that require VIEW_CUSTOMERS permission
router.get(
  "/",
  authorizePermission("VIEW_CUSTOMERS"),
  customerAudit.captureResponse(),
  customerAudit.adminAction("view_customers", {
    description: "Admin viewed all customers",
    targetModel: "Customer",
  }),
  cacheMiddleware(300, cacheKeys.allCustomers),
  getAllCustomers
);

router.get(
  "/:id",
  authorizePermission("VIEW_CUSTOMERS"),
  customerAudit.captureResponse(),
  customerAudit.adminAction("view_customer", {
    description: "Admin viewed a customer",
    targetModel: "Customer",
  }),
  cacheMiddleware(300, cacheKeys.customerById),
  getCustomerById
);

router.get(
  "/:id/dashboard",
  authorizePermission("VIEW_CUSTOMERS"),
  customerAudit.captureResponse(),
  customerAudit.adminAction("view_customer_dashboard", {
    description: "Admin viewed customer dashboard",
    targetModel: "Customer",
  }),
  getCustomerDashboard
);

// Routes that require EDIT_CUSTOMERS permission
router.post(
  "/",
  authorizePermission("EDIT_CUSTOMERS"),
  customerAudit.captureResponse(),
  customerAudit.adminAction("create_customer", {
    description: "Admin created a new customer",
    targetModel: "Customer",
  }),
  createCustomer
);

router.put(
  "/:id",
  authorizePermission("EDIT_CUSTOMERS"),
  customerAudit.captureResponse(),
  customerAudit.adminAction("update_customer", {
    description: "Admin updated a customer",
    targetModel: "Customer",
  }),
  updateCustomer
);

// Routes that require DELETE_CUSTOMERS permission
router.delete(
  "/:id",
  authorizePermission("DELETE_CUSTOMERS"),
  customerAudit.captureResponse(),
  customerAudit.adminAction("delete_customer", {
    description: "Admin deleted a customer",
    targetModel: "Customer",
  }),
  deleteCustomer
);

module.exports = router;
