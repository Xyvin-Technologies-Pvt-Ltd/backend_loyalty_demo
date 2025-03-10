const express = require("express");
const router = express.Router();

const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const loyalty_points_controller = require("./loyalty_points.controller");

const loyalty_points_audit = createAuditMiddleware("loyalty_points");   


router.use(authorizePermission());



router.post("/earn", loyalty_points_audit.captureResponse(), loyalty_points_audit.adminAction("earn_loyalty_points", {
    description: "Earn loyalty points",
    targetModel: "LoyaltyPoints",
    details: (req) => req.body,
}), loyalty_points_controller.earn_loyalty_points);


router.post("/redeem", loyalty_points_audit.captureResponse(), loyalty_points_audit.adminAction("redeem_loyalty_points", {
    description: "Redeem loyalty points",
    targetModel: "LoyaltyPoints",
    details: (req) => req.body,
}), loyalty_points_controller.redeem_loyalty_points);

router.post("/process-loyalty-event", loyalty_points_audit.captureResponse(), loyalty_points_audit.adminAction("process_loyalty_event", {
    description: "Process loyalty event",
    targetModel: "LoyaltyPoints",
    details: (req) => req.body,
}), loyalty_points_controller.process_loyalty_event);

module.exports = router;

