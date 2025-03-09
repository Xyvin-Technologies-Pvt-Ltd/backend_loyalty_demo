const express = require("express");
const router = express.Router();
const {
    createReferralLink,
    trackReferral,
    completeReferral,
    getReferralProgram,
 
} = require("./referral_program.controller");
const {
  cacheMiddleware,
  cacheKeys,
} = require("../../middlewares/redis_cache/cache.middleware");
const {
  cacheInvalidationMiddleware,
} = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");

const referralProgramAudit = createAuditMiddleware("referral_program_entry");

router.use(authorizePermission("VIEW_REFERRAL_PROGRAM"));


router.post("/", referralProgramAudit.captureResponse(), referralProgramAudit.adminAction("create_referral_program_entry", {
    description: "Admin created a new referral program rules",
    targetModel: "ReferralProgram",
    details: req => req.body
}), cacheInvalidationMiddleware(cacheKeys.allReferralPrograms), createReferralLink);

router.get("/", referralProgramAudit.captureResponse(), referralProgramAudit.adminAction("get_referral_program", {
    description: "Admin fetched the referral program",
    targetModel: "ReferralProgram",
    details: req => req.body
}), cacheMiddleware(3600, cacheKeys.allReferralPrograms), getReferralProgram);


//track referral
router.get("/:referralId", referralProgramAudit.captureResponse(), referralProgramAudit.adminAction("track_referral", {
    description: "Admin tracked the referral",
    targetModel: "ReferralProgram",
    details: req => req.params
}), trackReferral);

//complete referral
router.post("/complete", referralProgramAudit.captureResponse(), referralProgramAudit.adminAction("complete_referral", {
    description: "Admin completed the referral",
    targetModel: "ReferralProgram",
    details: req => req.body
}), completeReferral);




module.exports = router;









