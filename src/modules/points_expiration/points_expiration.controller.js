const response_handler = require("../../helpers/response_handler");
const PointsExpirationRules = require("../../models/points_expiration_rules_model");
const Transaction = require("../../models/transaction_model");
const Customer = require("../../models/customer_model");
const Tier = require("../../models/tier_model");
const pointsExpirationRulesValidation = require("./points_expiration.validator");
const { logger } = require("../../middlewares/logger");
const mongoose = require("mongoose");

/**
 * Get the current active points expiration rules
 */
exports.getAllRules = async (req, res) => {
    try {
        const rules = await PointsExpirationRules.find({is_active: true})
        .populate({
            path: "tier_extensions.tier_id",
            select: "name _id"  
        })
        .populate({
            path: "appType",
            select: "name _id"  
        })
        .populate({
            path: "updated_by",
            select: "name email _id"  
        });

        if (!rules) {
            return response_handler(res, 404, "No points expiration rules found");
        }

        return response_handler(res, 200, "Points expiration rules retrieved successfully", rules);
    } catch (error) {
        logger.error(`Error retrieving points expiration rules: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Create or update points expiration rules
 */
exports.createRules = async (req, res) => {
    try {
        // Validate request body
        const { error } = pointsExpirationRulesValidation.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const error_messages = error.details.map((err) => err.message).join(", ");
            return response_handler(res, 400, `Invalid input: ${error_messages}`);
        }

        // Get admin ID from request (assuming it's set by auth middleware)
        const admin_id = req.admin ? req.admin._id : null;

      
       
            // Create new rules
            const new_rules = new PointsExpirationRules({
                default_expiry_period: req.body.default_expiry_period,
                tier_extensions: req.body.tier_extensions,
                expiry_notifications: req.body.expiry_notifications,
                grace_period: req.body.grace_period,
                updated_by: admin_id
            });

            await new_rules.save();
            logger.info(`New points expiration rules created by admin ${admin_id}`);

            return response_handler(res, 201, "Points expiration rules created successfully", new_rules);
        
    } catch (error) {
        logger.error(`Error creating/updating points expiration rules: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

         
//getby id
exports.getRuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const rule = await PointsExpirationRules.findById(id)
        .populate({
            path: "tier_extensions.tier_id",
            select: "name _id"  
        })
        .populate({
            path: "appType",
            select: "name _id"  
        })
        .populate({
            path: "updated_by",
            select: "name email _id"  
        });
        if (!rule) {
            return response_handler(res, 404, "Points expiration rule not found");
        }
        return response_handler(res, 200, "Points expiration rule retrieved successfully", rule);
    } catch (error) {
        logger.error(`Error retrieving points expiration rule: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};


//edit rule
exports.editRule = async (req, res) => {
    try {
        const { id } = req.params;
        const rule = await PointsExpirationRules.findById(id);
        if (!rule) {
            return response_handler(res, 404, "Points expiration rule not found");
        }
        const admin_id = req.admin ? req.admin._id : null;
        rule.default_expiry_period = req.body.default_expiry_period;
        rule.tier_extensions = req.body.tier_extensions;    
        rule.expiry_notifications = req.body.expiry_notifications;
        rule.grace_period = req.body.grace_period;
        rule.updated_by = admin_id;
        await rule.save();
        return response_handler(res, 200, "Points expiration rule updated successfully", rule);
    } catch (error) {
        logger.error(`Error updating points expiration rule: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};


//delete rule
exports.deleteRule = async (req, res) => {
    try {
        const { id } = req.params;
        const rule = await PointsExpirationRules.findById(id);
        if (!rule) {
            return response_handler(res, 404, "Points expiration rule not found");
        }
        await rule.deleteOne();
        return response_handler(res, 200, "Points expiration rule deleted successfully");
    } catch (error) {
        logger.error(`Error deleting points expiration rule: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

//get by appid
exports.getRuleByAppId = async (req, res) => {
    try {
        const { appId } = req.params;
        const rule = await PointsExpirationRules.findOne({ appType: appId });
        if (!rule) {
            return response_handler(res, 404, "Points expiration rule not found");
        }
        return response_handler(res, 200, "Points expiration rule retrieved successfully", rule);
    } catch (error) {
        logger.error(`Error retrieving points expiration rule: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};