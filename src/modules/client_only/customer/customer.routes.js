const express = require("express");
const router = express.Router();
const customerController = require("./customer.controller");

const { createAuditMiddleware } = require("../../audit");

const { sdkAuth } = require("../../../middlewares/auth/sdk_auth");
const { sdkUserAuth } = require("../../../middlewares/auth/sdk_auth");


router.use(sdkAuth());
router.use(sdkUserAuth);

const SdkCustomerAudit = createAuditMiddleware("customer");

//get customer profile
router.get( "/:customer_id/profile", SdkCustomerAudit.captureResponse(),SdkCustomerAudit.sdkAction("get_customer_profile", {
    description: "Customer retrieved customer profile", 
    targetModel: "Customer",
    details: (req) => req.params,
}), customerController.getMyProfile);




router.get("/:customer_id/transactions", SdkCustomerAudit.captureResponse(),SdkCustomerAudit.sdkAction("get_customer_transactions", {
    description: "Customer retrieved customer transactions",
    targetModel: "Customer",
    details: (req) => req.params,
}), customerController.getMyTransactions);

//get customer points
router.get("/:customer_id/points" , SdkCustomerAudit.captureResponse(),SdkCustomerAudit.sdkAction("get_customer_points", {
    description: "Customer retrieved customer points",
    targetModel: "Customer",
    details: (req) => req.params,
}), customerController.getMyPoints);

//get customer notification preferences
router.get("/:customer_id/notification-preferences", SdkCustomerAudit.captureResponse(),SdkCustomerAudit.sdkAction("get_customer_notification_preferences", {
    description: "Customer retrieved customer notification preferences",
    targetModel: "Customer",
    details: (req) => req.params,
}), customerController.getMyNotificationPreferences);

//update customer notification preferences
router.put("/:customer_id/notification-preferences", SdkCustomerAudit.captureResponse(),SdkCustomerAudit.sdkAction("update_customer_notification_preferences", {
    description: "Customer updated customer notification preferences",
    targetModel: "Customer",
    details: (req) => req.params,
}), customerController.updateMyNotificationPreferences);

module.exports = router;
