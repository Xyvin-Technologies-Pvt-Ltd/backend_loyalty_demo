const ReferralProgram = require("../../models/referral_program_rule_model");
const ReferralEntry = require("../../models/referral_entry_model");
const Customer = require("../../models/customer_model");
const { logger } = require("../../middlewares/logger");
const response_handler = require("../../helpers/response_handler");


//who does this function work for?
//this function is used to create a referral link for a user
//it checks if the user has reached the referral limit
//if the user has reached the referral limit, it returns an error
//if the user has not reached the referral limit, it creates a referral link
//the referral link is then returned to the user


exports.createReferralLink = async (req, res) => {
    try {
      const { userId } = req.body;
      const program = await ReferralProgram.findOne({ isActive: true });
  
      if (!program) {
            return response_handler(res, 400, "No active referral program found.");
      }
  
      const userReferrals = await ReferralEntry.countDocuments({ referrer: userId });
  
      if (userReferrals >= program.maxReferralsPerUser) {
        return response_handler(res, 400, "Referral limit reached.");
      }
  
      const referralLink = `${process.env.FRONTEND_URL}/signup?ref=${userId}`;
      return response_handler(res, 200, "Referral link created successfully", referralLink);
    } catch (error) {
      return response_handler(res, 500, "Server error", error);
    }
  };

    //who does this function work for?
  //this function is used to track a referral
  //it checks if the referral is expired
  //if the referral is expired, it returns an error
  //if the referral is not expired, it returns the referral


  exports.trackReferral = async (req, res) => {
    try {
      const { referralId } = req.params;
      const referral = await ReferralEntry.findById(referralId);
  
      if (!referral) {
        return response_handler(res, 400, "Referral not found.");
      }
  
      // Check if expired
      await referral.checkExpiry();
  
      return response_handler(res, 200, "Referral tracked successfully", referral);
    } catch (error) {
      return response_handler(res, 500, "Server error", error);
    }
  };




  exports.completeReferral = async (req, res) => {
  try {
    const { referralId, purchaseAmount } = req.body;
    const referral = await ReferralEntry.findById(referralId);

    if (!referral) {
      return response_handler(res, 400, "Referral not found.");
    }

    const program = await ReferralProgram.findOne({ isActive: true });

    if (purchaseAmount < program.minimumPurchaseAmount) {
      return response_handler(res, 400, "Minimum purchase amount not met.");
    }

    referral.status = "completed";
    referral.completedAt = new Date();
    referral.referralPoints.referrerPoints = program.pointsForReferrer;
    referral.referralPoints.refereePoints = program.pointsForReferee;
    await referral.save();

    return response_handler(res, 200, "Referral completed successfully.", referral);
  } catch (error) {
    return response_handler(res, 500, "Server error", error);
  }
};


exports.getReferralProgram = async (req, res) => {
  try {
    const referralProgram = await ReferralProgram.findOne({ isActive: true });
    return response_handler(res, 200, "Referral program fetched successfully", referralProgram);
  } catch (error) {
    return response_handler(res, 500, "Server error", error);
  }
};





