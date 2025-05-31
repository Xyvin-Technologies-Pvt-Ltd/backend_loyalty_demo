const express = require("express");
const router = express.Router();
const payment_method_controller = require("./payment_method.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  cacheInvalidationMiddleware,
  enhancedCacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const {
  cacheMiddleware,
  cacheKeys,
  cachePatterns,
} = require("../../middlewares/redis_cache/cache.middleware");

const paymentMethodAudit = createAuditMiddleware("payment_method");

router.get(
  "/",
  paymentMethodAudit.dataAccess("view_payment_methods", {
    description: "User viewed payment methods",
    targetModel: "PaymentMethod",
  }),
  cacheMiddleware(5, cacheKeys.allPaymentMethods),
  payment_method_controller.getPaymentMethods
);

router.post(
  "/",
  paymentMethodAudit.captureResponse(),
  paymentMethodAudit.adminAction("create_payment_method", {
    description: "User created a payment method",
    targetModel: "PaymentMethod",
  }),
  payment_method_controller.createPaymentMethod,
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allPaymentMethods }, // Clear all payment methods cache (all query variations)
    cacheKeys.allPaymentMethods
  )
);

router.put(
  "/:id",
  paymentMethodAudit.captureResponse(),
  paymentMethodAudit.adminAction("update_payment_method", {
    description: "User updated a payment method",
    targetModel: "PaymentMethod",
  }),
  payment_method_controller.updatePaymentMethod,
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allPaymentMethods }, // Clear all payment methods cache (all query variations)
    cacheKeys.allPaymentMethods
  )
);

router.delete(
  "/:id",
  paymentMethodAudit.captureResponse(),
  paymentMethodAudit.adminAction("delete_payment_method", {
    description: "User deleted a payment method",
    targetModel: "PaymentMethod",
  }),
  payment_method_controller.deletePaymentMethod,
  enhancedCacheInvalidationMiddleware(
    { pattern: cachePatterns.allPaymentMethods }, // Clear all payment methods cache (all query variations)
    cacheKeys.allPaymentMethods
  )
);

router.get(
  "/:id",
  paymentMethodAudit.dataAccess("view_payment_method", {
    description: "User viewed a payment method",
    targetModel: "PaymentMethod",
  }),
  cacheMiddleware(5, cacheKeys.paymentMethodById), 
  payment_method_controller.getPaymentMethodById
);

module.exports = router;