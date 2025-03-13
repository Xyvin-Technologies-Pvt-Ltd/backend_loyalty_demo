const customerRoutes = require("./customer/customer.routes");
const express = require("express");
const router = express.Router();

router.use("/customer", customerRoutes);

module.exports = router;
