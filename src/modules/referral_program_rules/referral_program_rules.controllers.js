const { ReferralProgramRules } = require("../../models/referral_program_rule_model");
const response_handler = require("../../helpers/response_handler");

exports.createReferralProgramRules = async (req, res) => {
    try {   
        const { referralRules } = req.body;
        const referralProgramRules = await ReferralProgramRules.create(referralRules);
        return response_handler(res, 200, "Referral program rules created successfully", referralProgramRules);
    } catch (error) {
        return response_handler(res, 500, "Server error", error);
    }
};

exports.getReferralProgramRules = async (req, res) => {
    try {
        const referralProgramRules = await ReferralProgramRules.find();
        return response_handler(res, 200, "Referral program rules fetched successfully", referralProgramRules);
    } catch (error) {
        return response_handler(res, 500, "Server error", error);
    }
};

exports.updateReferralProgramRules = async (req, res) => {
    try {
        const { referralRules } = req.body;
        const referralProgramRules = await ReferralProgramRules.findByIdAndUpdate(req.params.id, referralRules, { new: true });
        return response_handler(res, 200, "Referral program rules updated successfully", referralProgramRules);
    } catch (error) {
        return response_handler(res, 500, "Server error", error);
    }
};

exports.deleteReferralProgramRules = async (req, res) => {
    try {
        const referralProgramRules = await ReferralProgramRules.findByIdAndDelete(req.params.id);
        return response_handler(res, 200, "Referral program rules deleted successfully", referralProgramRules);
    } catch (error) {
        return response_handler(res, 500, "Server error", error);
    }
};





