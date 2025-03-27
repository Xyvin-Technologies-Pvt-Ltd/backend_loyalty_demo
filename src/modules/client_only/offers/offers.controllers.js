const response_handler = require("../../../helpers/response_handler");
const KedmahOffers = require("../../../models/kedmah_offers_model");
const Customer = require("../../../models/customer_model");
const { logger } = require("../../../middlewares/logger");

exports.get_kedhmah_offers = async (req, res) => {
    try {
        // Get all active offers
        const offers = await KedmahOffers.find({ isActive: true })
            .populate("serviceCategory")
            .populate("appType")
            .populate("eventType")
            .select("-usageHistory");

        // Filter offers based on validity period
        const currentDate = new Date();
        const validOffers = offers.filter(offer =>
            currentDate >= offer.validityPeriod.startDate &&
            currentDate <= offer.validityPeriod.endDate
        );

        // Check eligibility for each offer
        const eligibleOffers = await Promise.all(
            validOffers.map(async (offer) => {
                try {
                    // Check basic eligibility
                    const eligibilityCheck = await offer.checkEligibility(
                        req.user,
                        0, // Default transaction value for initial check
                        "ALL" // Default payment method for initial check
                    );

                    if (eligibilityCheck.eligible) {
                        return {
                            ...offer.toObject(),
                            eligibility: {
                                isEligible: true,
                                reason: "Eligible for this offer"
                            }
                        };
                    } else {
                        return {
                            ...offer.toObject(),
                            eligibility: {
                                isEligible: false,
                                reason: eligibilityCheck.reason
                            }
                        };
                    }
                } catch (error) {
                    logger.error(`Error checking eligibility for offer ${offer._id}: ${error.message}`);
                    return {
                        ...offer.toObject(),
                        eligibility: {
                            isEligible: false,
                            reason: "Error checking eligibility"
                        }
                    };
                }
            })
        );

        // Sort offers by eligibility and active status
        const sortedOffers = eligibleOffers.sort((a, b) => {
            // First sort by eligibility
            if (a.eligibility.isEligible !== b.eligibility.isEligible) {
                return b.eligibility.isEligible - a.eligibility.isEligible;
            }
            // Then by end date (closest to expiry first)
            return new Date(a.validityPeriod.endDate) - new Date(b.validityPeriod.endDate);
        });

        return response_handler.success(
            res,
            "Kedmah offers fetched successfully",
            sortedOffers
        );
    } catch (error) {
        logger.error(`Error fetching kedmah offers: ${error.message}`);
        return response_handler.error(res, error);
    }
};

exports.get_kedhmah_offer = async (req, res) => {
    try {
        const { id } = req.params;
        const { transaction_value, payment_method } = req.query;

        // Find and validate offer
        const offer = await KedmahOffers.findById(id)
            .populate("serviceCategory")
            .populate("appType")
            .populate("eventType")
            .select("-usageHistory");

        if (!offer) {
            return response_handler.error(res, "Offer not found", 404);
        }

        // Check eligibility with transaction value and payment method
        const eligibilityCheck = await offer.checkEligibility(
            req.user,
            parseFloat(transaction_value) || 0,
            payment_method || "ALL"
        );

        return response_handler.success(
            res,
            "Kedmah offer fetched successfully",
            {
                ...offer.toObject(),
                eligibility: {
                    isEligible: eligibilityCheck.eligible,
                    reason: eligibilityCheck.reason
                }
            }
        );
    } catch (error) {
        logger.error(`Error fetching kedmah offer: ${error.message}`);
        return response_handler.error(res, error);
    }
};

exports.check_offer_eligibility = async (req, res) => {
    try {
        const { offer_id, transaction_value, payment_method } = req.body;

        // Validate required fields
        if (!offer_id) {
            return response_handler.error(res, "Offer ID is required", 400);
        }

        // Find offer
        const offer = await KedmahOffers.findById(offer_id);
        if (!offer) {
            return response_handler.error(res, "Offer not found", 404);
        }

        // Check eligibility
        const eligibilityCheck = await offer.checkEligibility(
            req.user,
            parseFloat(transaction_value) || 0,
            payment_method || "ALL"
        );

        return response_handler.success(
            res,
            "Offer eligibility checked successfully",
            {
                offerId: offer_id,
                isEligible: eligibilityCheck.eligible,
                reason: eligibilityCheck.reason,
                offerDetails: {
                    title: offer.title,
                    description: offer.description,
                    offerType: offer.offerType,
                    discountDetails: offer.discountDetails,
                    validityPeriod: offer.validityPeriod,
                    termsAndConditions: offer.termsAndConditions,
                    redemptionInstructions: offer.redemptionInstructions
                }
            }
        );
    } catch (error) {
        logger.error(`Error checking offer eligibility: ${error.message}`);
        return response_handler.error(res, error);
    }
};