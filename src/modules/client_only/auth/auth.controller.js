const { logger } = require("../../../middlewares/logger");
const response_handler = require("../../../helpers/response_handler");
const Customer = require("../../../models/customer");
const { v4: uuidv4 } = require('uuid');
const Tier = require("../../../models/tier_model");


exports.customer_register = async (req, res) => {
    try {
        const { name, email, phone, customerId, device_type,device_token, referral_code} = req.body;

        const customer_email = await Customer.findOne({ email });
        if (customer_email) {
            return response_handler.error(res, "Customer already exists via email   ");
        }

        const customer_id = await Customer.findOne({ customerId });
        if (customer_id) {
            return response_handler.error(res, "Customer already exists via customerId");
        }

        //find basic tier
        const basic_tier = await Tier.findOne({ points_required: 0 });
        const newCustomer = new Customer({ 
            customer_id,
            name,
            email,
            phone,
            tier: basic_tier._id,
            device_type,
            device_token,
            referral_code:  uuidv4(),
         });
          // Handle referral system
          if (referral_code) {
            const referrer = await Customer.findOne({ referral_code });
            if (referrer) {
                newCustomer.referred_by = referrer._id;
                referrer.user_referer_count += 1;
                await referrer.save();
            }
        }
        await newCustomer.save();
        return response_handler.success(res, "Customer registered successfully", newCustomer);
    } catch (error) {
        logger.error(error);
        return response_handler.error(res, error);
    }
};



