const response_handler = require("../../helpers/response_handler");
const KedmahOffers = require("../../models/kedmah_offers_model");
const User = require("../../models/user_model"); // Assuming you have a user model
const { kedmahOffersValidationSchema, validateOfferEligibility } = require("./kedmah_offers.validator");

exports.create = async (req, res) => {
    try {
        const { error } = kedmahOffersValidationSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            const error_messages = error.details.map((err) => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }

        const new_offer = await KedmahOffers.create(req.body);

        return response_handler(
            res,
            201,
            "Kedmah loyalty offer created successfully!",
            new_offer
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.list = async (req, res) => {
    try {
        const { offerType, serviceCategory, isActive, appType } = req.query;

        const query = {};
        if (offerType) query.offerType = offerType;
        if (serviceCategory) query.serviceCategory = serviceCategory;
        if (appType) query.appType = appType;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // Only show active offers that are currently valid
        if (req.query.activeOnly === 'true') {
            query.isActive = true;
            query['validityPeriod.startDate'] = { $lte: new Date() };
            query['validityPeriod.endDate'] = { $gte: new Date() };
        }

        const offers = await KedmahOffers.find(query)
            .populate("serviceCategory")
            .populate("appType")
            .populate("eventType")
            .select("-usageHistory");

        return response_handler(
            res,
            200,
            "Kedmah loyalty offers fetched successfully!",
            offers
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};



exports.get_offer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await KedmahOffers.findById(id)
            .populate("serviceCategory")
            .populate("appType")
            .populate("eventType")
            .select("-usageHistory");

        if (!offer) {
            return response_handler(res, 404, "Offer not found");
        }

        return response_handler(
            res,
            200,
            "Kedmah loyalty offer fetched successfully!",
            offer
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.update_offer = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the update payload
        const { error } = kedmahOffersValidationSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            const error_messages = error.details.map((err) => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }

        const updated_offer = await KedmahOffers.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updated_offer) {
            return response_handler(res, 404, "Offer not found");
        }

        return response_handler(
            res,
            200,
            "Kedmah loyalty offer updated successfully!",
            updated_offer
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.delete_offer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted_offer = await KedmahOffers.findByIdAndDelete(id);

        if (!deleted_offer) {
            return response_handler(res, 404, "Offer not found");
        }

        return response_handler(
            res,
            200,
            "Kedmah loyalty offer deleted successfully!",
            deleted_offer
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.check_user_eligibility = async (req, res) => {
    try {
        const { error } = validateOfferEligibility.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const error_messages = error.details.map((err) => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }

        const { offerId, userId, transactionValue, paymentMethod } = req.body;

        // Find the offer and user
        const offer = await KedmahOffers.findById(offerId);
        const user = await User.findById(userId);

        if (!offer || !user) {
            return response_handler(res, 404, "Offer or user not found");
        }
        //check if offer is within tier
        if (offer.tier !== user.tier) {
            return response_handler(res, 400, "Offer is not within tier", {
                eligible: false,
                reason: "Offer is not within tier"
            });
        }
        // Check if offer is active and within validity period
        const now = new Date();
     
        if (!offer.isActive ||
            now < new Date(offer.validityPeriod.startDate) ||
            now > new Date(offer.validityPeriod.endDate)) {
            return response_handler(res, 400, "Offer is not active or has expired", {
                eligible: false,
                reason: "Offer is not active or has expired"
            });
        }

        // Check transaction value against min/max requirements
        if (transactionValue < offer.conditions.minTransactionValue) {
            return response_handler(res, 400, "Transaction value below minimum required", {
                eligible: false,
                reason: "Transaction value below minimum required"
            });
        }

        if (offer.conditions.maxTransactionValue !== null &&
            transactionValue > offer.conditions.maxTransactionValue) {
            return response_handler(res, 400, "Transaction value above maximum allowed", {
                eligible: false,
                reason: "Transaction value above maximum allowed"
            });
        }

        // Check payment method
        if (!offer.conditions.applicablePaymentMethods.includes("ALL") &&
            !offer.conditions.applicablePaymentMethods.includes(paymentMethod)) {
            return response_handler(res, 400, "Payment method not eligible for this offer", {
                eligible: false,
                reason: "Payment method not eligible for this offer"
            });
        }

        // Check usage limits
        const userUsageHistory = offer.usageHistory.filter(usage =>
            usage.userId.toString() === userId.toString()
        );

        const totalUsage = userUsageHistory.length;
        if (totalUsage >= offer.usagePolicy.maxUsagePerUser &&
            offer.usagePolicy.frequency === "TOTAL") {
            return response_handler(res, 400, "Maximum usage limit reached", {
                eligible: false,
                reason: "Maximum usage limit reached"
            });
        }

        // Check frequency-based limits
        let relevantDate;
        switch (offer.usagePolicy.frequency) {
            case 'DAILY':
                relevantDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'WEEKLY':
                relevantDate = new Date(now.setDate(now.getDate() - now.getDay()));
                break;
            case 'MONTHLY':
                relevantDate = new Date(now.setDate(1));
                break;
            default:
                relevantDate = null;
        }

        if (relevantDate) {
            const usageInPeriod = userUsageHistory.filter(usage =>
                new Date(usage.usedAt) >= relevantDate
            ).length;

            if (usageInPeriod >= offer.usagePolicy.maxUsagePerUser) {
                return response_handler(res, 400, `Usage limit for this ${offer.usagePolicy.frequency.toLowerCase()} period reached`, {
                    eligible: false,
                    reason: `Usage limit for this ${offer.usagePolicy.frequency.toLowerCase()} period reached`
                });
            }
        }

        // User is eligible
        return response_handler(
            res,
            200,
            "User is eligible for this offer",
            {
                eligible: true,
                offer: {
                    _id: offer._id,
                    title: offer.title,
                    description: offer.description,
                    offerType: offer.offerType,
                    discountDetails: offer.discountDetails,
                    bonusPoints: offer.bonusPoints,
                    redemptionInstructions: offer.redemptionInstructions
                }
            }
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
};

exports.redeem_offer = async (req, res) => {
    try {
        const { offerId, userId, transactionId } = req.body;

        // Find the offer
        const offer = await KedmahOffers.findById(offerId);

        if (!offer) {
            return response_handler(res, 404, "Offer not found");
        }

        // First check eligibility
        const eligibilityCheck = await exports.check_user_eligibility({
            body: {
                offerId,
                userId,
                transactionValue: req.body.transactionValue,
                paymentMethod: req.body.paymentMethod
            }
        }, {
            locals: {},
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            }
        });

        // If not eligible, return the eligibility response
        if (!eligibilityCheck.data.data || !eligibilityCheck.data.data.eligible) {
            return response_handler(
                res,
                eligibilityCheck.statusCode,
                eligibilityCheck.data.message,
                eligibilityCheck.data.data
            );
        }

        // Record the redemption
        offer.usageHistory.push({
            userId,
            usedAt: new Date(),
            transactionId
        });

        await offer.save();

        return response_handler(
            res,
            200,
            "Offer redeemed successfully",
            {
                redeemed: true,
                offer: {
                    _id: offer._id,
                    title: offer.title,
                    description: offer.description,
                    offerType: offer.offerType,
                    discountDetails: offer.discountDetails,
                    bonusPoints: offer.bonusPoints
                }
            }
        );
    } catch (error) {
        console.error(error);
        return response_handler(
            res,
            500,
            `Internal Server Error. ${error.message}`
        );
    }
}; 