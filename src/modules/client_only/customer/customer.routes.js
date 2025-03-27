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



module.exports = router;
