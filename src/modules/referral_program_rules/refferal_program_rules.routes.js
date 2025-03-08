const express = require("express");
const router = express.Router();
const {
    createReferralProgramRules,
    getReferralProgramRules,
    updateReferralProgramRules,
    deleteReferralProgramRules
} = require("./referral_program_rules.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");

const referralProgramRulesAudit = createAuditMiddleware("referral_program_rules");

router.use(authorizePermission("VIEW_REFERRAL_PROGRAM"));

router.post("/", referralProgramRulesAudit.captureResponse(), referralProgramRulesAudit.adminAction("create_referral_program_rules", {
    description: "Admin created a new referral program rules",
    targetModel: "ReferralProgramRules",
    details: req => req.body
}), createReferralProgramRules);

router.get("/", referralProgramRulesAudit.captureResponse(), referralProgramRulesAudit.adminAction("get_referral_program_rules", {
    description: "Admin fetched the referral program rules",
    targetModel: "ReferralProgramRules",
    details: req => req.body
}), getReferralProgramRules);


router.put("/:id", referralProgramRulesAudit.captureResponse(), referralProgramRulesAudit.adminAction("update_referral_program_rules", {
    description: "Admin updated the referral program rules",
    targetModel: "ReferralProgramRules",
    details: req => req.body
}), updateReferralProgramRules);


router.delete("/:id", referralProgramRulesAudit.captureResponse(), referralProgramRulesAudit.adminAction("delete_referral_program_rules", {
    description: "Admin deleted the referral program rules",
    targetModel: "ReferralProgramRules",
    details: req => req.body
}), deleteReferralProgramRules);


module.exports = router;



