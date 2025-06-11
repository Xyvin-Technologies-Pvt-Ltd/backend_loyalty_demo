const express = require("express");
const router = express.Router();
const kedmah_sdk_controller = require("./new_kedmah_sdk.controller.js");
const key_protect = require("../../middlewares/auth/key_protect");
const { createAuditMiddleware } = require("../audit");
const validate = require("../../middlewares/validate");
const {
  registerCustomerSchema,
  viewCustomerSchema,
  addPointsSchema,
  redeemPointsSchema,
  cancelRedemptionSchema,
} = require("./new_kedmah_sdk.validator");

// Create audit middleware for the new Khedmah SDK module
const kedmahSdkAudit = createAuditMiddleware("new_kedmah_sdk");

router.post('/generate-token', key_protect, kedmah_sdk_controller.generateToken)

router.post(
  "/register",
  key_protect,
  validate(registerCustomerSchema),
  kedmahSdkAudit.dataModification("customer_registration", {
    description: "Customer registration via Khedmah SDK",
    targetModel: "Customer",
    details: (req) => ({
      customer_id: req.body.customer_id,
      requested_by: req.body.requested_by,
    }),
  }),
  kedmahSdkAudit.captureResponse(),
  kedmah_sdk_controller.registerCustomer
);

router.post(
  "/customer",
  key_protect,
  validate(viewCustomerSchema),
  kedmahSdkAudit.dataAccess("view_customer", {
    description: "View customer details via Khedmah SDK",
    details: (req) => ({
      customer_id: req.body.customer_id,
    }),
  }),
  kedmahSdkAudit.captureResponse(),
  kedmah_sdk_controller.viewCustomer
);

router.post(
  "/add-points",
  key_protect,
  validate(addPointsSchema),
  kedmahSdkAudit.dataModification("add_points", {
    description: "Add loyalty points via Khedmah SDK",
    targetModel: "Transaction",
    details: (req) => ({
      customer_id: req.body.customer_id,
      transaction_id: req.body.transaction_id,
      transaction_value: req.body.transaction_value,
      requested_by: req.body.requested_by,
    }),
  }),
  kedmahSdkAudit.captureResponse(),
  kedmah_sdk_controller.addPoints
);

router.post(
  "/redeem-points",
  key_protect,
  validate(redeemPointsSchema),
  kedmahSdkAudit.dataModification("redeem_points", {
    description: "Redeem loyalty points via Khedmah SDK",
    targetModel: "Transaction",
    details: (req) => ({
      customer_id: req.body.customer_id,
      transaction_id: req.body.transaction_id,
      total_spent: req.body.total_spent,
      requested_by: req.body.requested_by,
    }),
  }),
  kedmahSdkAudit.captureResponse(),
  kedmah_sdk_controller.redeemPoints
);

router.post(
  "/cancel-redeem-points",
  key_protect,
  validate(cancelRedemptionSchema),
  kedmahSdkAudit.dataModification("cancel_redemption", {
    description: "Cancel point redemption via Khedmah SDK",
    targetModel: "Transaction",
    details: (req) => ({
      customer_id: req.body.customer_id,
      transaction_id: req.body.transaction_id,
    }),
  }),
  kedmahSdkAudit.captureResponse(),
  kedmah_sdk_controller.cancelRedemption
);

module.exports = router;
