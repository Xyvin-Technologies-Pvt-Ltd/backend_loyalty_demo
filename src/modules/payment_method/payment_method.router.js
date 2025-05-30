const express = require("express");
const router = express.Router();
const payment_method_controller = require("./payment_method.controller");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const {
  cacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const {
  cacheMiddleware,
  cacheKeys,
} = require("../../middlewares/redis_cache/cache.middleware");

const paymentMethodAudit = createAuditMiddleware("payment_method");


router.get("/", authorizePermission(), paymentMethodAudit.dataAccess("view_payment_methods", {
    description: "User viewed payment methods",
    targetModel: "PaymentMethod",
}), cacheMiddleware(60, cacheKeys.allPaymentMethods), payment_method_controller.getPaymentMethods);        


//create payment method
router.post("/", authorizePermission(), paymentMethodAudit.captureResponse(), paymentMethodAudit.adminAction("create_payment_method", {
    description: "User created a payment method",
    targetModel: "PaymentMethod",
}), payment_method_controller.createPaymentMethod);

//update payment method
router.put("/:id", authorizePermission(), paymentMethodAudit.captureResponse(), paymentMethodAudit.adminAction("update_payment_method", {
    description: "User updated a payment method",
    targetModel: "PaymentMethod",
}), payment_method_controller.updatePaymentMethod); 

//delete payment method
router.delete("/:id", authorizePermission(), paymentMethodAudit.captureResponse(), paymentMethodAudit.adminAction("delete_payment_method", {
    description: "User deleted a payment method",
    targetModel: "PaymentMethod",
}), payment_method_controller.deletePaymentMethod); 

//get payment method by id
router.get("/:id", authorizePermission(), paymentMethodAudit.dataAccess("view_payment_method", {
    description: "User viewed a payment method",
    targetModel: "PaymentMethod",
}), payment_method_controller.getPaymentMethodById);





module.exports = router;

