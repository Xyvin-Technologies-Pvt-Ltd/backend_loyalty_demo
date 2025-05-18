const { logger } = require("../../../middlewares/logger");
const response_handler = require("../../../helpers/response_handler");
const Customer = require("../../../models/customer_model"); 
const { v4: uuidv4 } = require("uuid");
const Tier = require("../../../models/tier_model");
const ReferralProgramRule = require("../../../models/referral_program_rule_model");

exports.customer_register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      customer_id,
      device_type,
      device_token,
      referral_code,
      app_type,
      notification_preferences
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !customer_id || !password) {
      return response_handler(res, 400, "Required fields are missing", null);
    }

    // Validate device type
    if (device_type && !["android", "ios", "web"].includes(device_type)) {
      return response_handler(res, 400, "Invalid device type", null);
    }

    // Check for existing customer by email
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return response_handler(res, 400, "Email already registered", null);
    }

    // Check for existing customer by customer_id
    const existingCustomerId = await Customer.findOne({ customer_id });
    if (existingCustomerId) {
      return response_handler(res, 400, "Customer ID already exists", null);
    }

    // Check for existing customer by phone
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return response_handler(res, 400, "Phone number already registered", null);
    }

    // Find basic tier
    const basicTier = await Tier.findOne({ points_required: 0 });
    if (!basicTier) {
      return response_handler(res, 404, "Basic tier not found", null);
    }

    // Handle referral system
    let referred_by = null;
    let referralPoints = 0;
    if (referral_code) {
      const referrerCustomer = await Customer.findOne({ referral_code });
      if (referrerCustomer) {
        referred_by = referrerCustomer._id;

        // Get referral program rules
        const referralRule = await ReferralProgramRule.findOne({ is_active: true });
        if (referralRule) {
          referralPoints = referralRule.referral_points;
        }
      }
    }

    // Create new customer
    const newCustomer = new Customer({
      customer_id,
      name,
      email,
      phone,
      tier: basicTier._id,
      referral_code: uuidv4(),
      referred_by,
      user_referer_count: 0,
      status: true,
      app_type,
      device_token: device_token ? [device_token] : [],
      device_type,
      notification_preferences: notification_preferences || {
        email: true,
        sms: true,
        push: true
      },
      total_points: referralPoints,
      last_active: new Date()
    });

    await newCustomer.save();

    // Remove sensitive information from response
    const customerResponse = newCustomer.toObject();
    delete customerResponse.password;
    delete customerResponse.__v;

    return response_handler(
      res,
      200,
      "Customer registered successfully",
      customerResponse
    );
  } catch (error) {
    logger.error("Customer registration error:", error);
    return response_handler(res, 500, "Registration failed", error);
  }
};
