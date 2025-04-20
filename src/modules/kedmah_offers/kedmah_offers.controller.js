const response_handler = require("../../helpers/response_handler");
const KedmahOffers = require("../../models/kedmah_offers_model");
const Customer = require("../../models/customer_model"); // Assuming you have a user model
const {
  kedmahOffersValidationSchema,
  validateOfferEligibility,
} = require("./kedmah_offers.validator");
const Transaction = require("../../models/transaction_model");
const { logger } = require("../../middlewares/logger");

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
    logger.error(`Error creating kedmah offer: ${error.message}`);
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

exports.list = async (req, res) => {
  try {
    const {
      offerType,
      serviceCategory,
      isActive,
      appType,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (offerType) query.offerType = offerType;
    if (serviceCategory) query.serviceCategory = serviceCategory;
    if (appType) query.appType = appType;
    if (isActive !== undefined) query.isActive = isActive === "true";

    // Only show active offers that are currently valid
    if (req.query.activeOnly === "true") {
      query.isActive = true;
      query["validityPeriod.startDate"] = { $lte: new Date() };
      query["validityPeriod.endDate"] = { $gte: new Date() };
    }

    const offers = await KedmahOffers.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("serviceCategory")
      .populate("eventType")
      .select("-usageHistory");
const total = await KedmahOffers.countDocuments(query);
    return response_handler(
      res,
      200,
      "Kedmah loyalty offers fetched successfully!",
      offers,total
    );
  } catch (error) {
    logger.error(`Error fetching kedmah offers: ${error.message}`);
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
    logger.error(`Error fetching kedmah offer: ${error.message}`);
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
    logger.error(`Error updating kedmah offer: ${error.message}`);
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
    logger.error(`Error deleting kedmah offer: ${error.message}`);
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

// Check user eligibility means the user is eligible for the offer

exports.check_user_eligibility = async (req, res) => {
  try {
    const { offerId, userId, transactionValue, paymentMethod } = req.body;

    // Find the offer and user
    const offer = await KedmahOffers.findById(offerId);
    if (!offer) {
      return response_handler(res, 404, "Offer not found");
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return response_handler(res, 404, "User not found");
    }

    // Use the model's eligibility checking method
    const eligibilityCheck = await offer.checkEligibility(
      user,
      transactionValue,
      paymentMethod
    );

    if (!eligibilityCheck.eligible) {
      return response_handler(res, 400, eligibilityCheck.reason, {
        eligible: false,
        reason: eligibilityCheck.reason,
      });
    }

    // User is eligible
    return response_handler(res, 200, "User is eligible for this offer", {
      eligible: true,
      offer: {
        _id: offer._id,
        title: offer.title,
        description: offer.description,
        offerType: offer.offerType,
        discountDetails: offer.discountDetails,
        validityPeriod: offer.validityPeriod,
        redemptionInstructions: offer.redemptionInstructions,
      },
    });
  } catch (error) {
    console.error(error);
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

// Redeem offer means the user is eligible for the offer and the user is redeeming the offer

exports.redeem_offer = async (req, res) => {
  try {
    const {
      offerId,
      customerId,
      transactionId,
      transactionValue,
      paymentMethod,
    } = req.body;

    // Find the offer and user
    const offer = await KedmahOffers.findById(offerId);
    if (!offer) {
      return response_handler(res, 404, "Offer not found");
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return response_handler(res, 404, "Customer not found");
    }

    // First check eligibility
    const eligibilityCheck = await offer.checkEligibility(
      customer,
      transactionValue,
      paymentMethod
    );

    // If not eligible, return the reason
    if (!eligibilityCheck.eligible) {
      return response_handler(res, 400, eligibilityCheck.reason, {
        eligible: false,
        reason: eligibilityCheck.reason,
      });
    }

    //Transaction registration
    const transaction = await Transaction.create({
      customerId,
      transactionValue,
      paymentMethod,
      offerId: offer._id,
      status: "SUCCESS",
    });
    // Record the redemption
    offer.usageHistory.push({
      customerId,
      usedAt: new Date(),
      transactionId,
    });

    await offer.save();
    await transaction.save();

    return response_handler(res, 200, "Offer redeemed successfully", {
      redeemed: true,
      offer: {
        _id: offer._id,
        title: offer.title,
        description: offer.description,
        offerType: offer.offerType,
        discountDetails: offer.discountDetails,
      },
    });
  } catch (error) {
    console.error(error);
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

// Get user offers by user id means the offers that the user is eligible

exports.getUserOffers = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { appType } = req.query;

    // Find the user to check tier
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return response_handler(res, 404, "Customer not found");
    }

    // Get user tiers
    const customerTiers = customer.tiers || [];

    // Build query for eligible offers
    const query = {
      isActive: true,
      "validityPeriod.startDate": { $lte: new Date() },
      "validityPeriod.endDate": { $gte: new Date() },
    };

    // Filter by app type if specified
    if (appType) {
      query.appType = appType;
    }

    // Find all active offers
    const allOffers = await KedmahOffers.find(query)
      .populate("serviceCategory")
      .populate("appType")
      .populate("eventType")
      .select("-usageHistory");

    // Filter offers based on eligibility criteria
    const eligibleOffers = [];
    for (const offer of allOffers) {
      // Check if user tier is eligible
      const tierEligible = offer.eligibilityCriteria.tiers.some((tier) =>
        customerTiers.includes(tier.toString())
      );

      // Check user type eligibility
      const typeEligible =
        offer.eligibilityCriteria.userTypes.includes("ALL") ||
        offer.eligibilityCriteria.userTypes.includes(customer.userType);

      // Check points balance
      const pointsEligible =
        customer.pointsBalance >= offer.eligibilityCriteria.minPointsBalance;

      // Check transaction history
      const transactionEligible =
        customer.transactionCount >=
        offer.eligibilityCriteria.minTransactionHistory;

      if (
        tierEligible &&
        typeEligible &&
        pointsEligible &&
        transactionEligible
      ) {
        eligibleOffers.push(offer);
      }
    }

    return response_handler(
      res,
      200,
      "Eligible Kedmah loyalty offers fetched successfully!",
      eligibleOffers
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
