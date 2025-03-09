const express = require("express");
const router = express.Router();
const emailRoutes = require("./email/email.routes");
const pushRoutes = require("./push/push.routes");
const smsRoutes = require("./sms/sms.routes");

// Mount the sub-routers
router.use("/email", emailRoutes);
router.use("/push", pushRoutes);
router.use("/sms", smsRoutes);

module.exports = router;
