const ConversionRule = require('../../../models/conversion_rule.model');
const response_handler = require('../../../helpers/response_handler');
const { logger } = require('../../../middlewares/logger');
const { AuditService } = require('../../audit');

/**
 * Get all conversion rules
 * @route GET /api/v1/conversion/rules
 */
exports.getAllConversionRules = async (req, res) => {
    try {
        const rules = await ConversionRule.find().sort({ createdAt: -1 });

        return response_handler(res, 200, "Conversion rules retrieved successfully", rules);
    } catch (error) {
        logger.error(`Error retrieving conversion rules: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "get_conversion_rules",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error retrieving conversion rules",
            errorMessage: error.message,
            stackTrace: error.stack,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get active conversion rules
 * @route GET /api/v1/conversion/rules/active
 */
exports.getActiveConversionRules = async (req, res) => {
    try {
        const rules = await ConversionRule.findActiveRules();

        return response_handler(res, 200, "Active conversion rules retrieved successfully", rules);
    } catch (error) {
        logger.error(`Error retrieving active conversion rules: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "get_active_conversion_rules",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error retrieving active conversion rules",
            errorMessage: error.message,
            stackTrace: error.stack,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get conversion rule by ID
 * @route GET /api/v1/conversion/rules/:id
 */
exports.getConversionRuleById = async (req, res) => {
    try {
        const rule = await ConversionRule.findById(req.params.id);

        if (!rule) {
            return response_handler(res, 404, "Conversion rule not found");
        }

        return response_handler(res, 200, "Conversion rule retrieved successfully", rule);
    } catch (error) {
        logger.error(`Error retrieving conversion rule: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "get_conversion_rule",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error retrieving conversion rule",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: { ruleId: req.params.id },
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Create a new conversion rule
 * @route POST /api/v1/conversion/rules
 */
exports.createConversionRule = async (req, res) => {
    try {
        const newRule = new ConversionRule({
            ...req.body,
            createdBy: req.admin ? req.admin._id : null,
        });

        await newRule.save();

        // Log admin action
        if (req.admin) {
            await AuditService.logAdminAction({
                action: "create_conversion_rule",
                user: req.admin._id,
                userModel: "Admin",
                userName: req.admin.name,
                userEmail: req.admin.email,
                targetId: newRule._id,
                targetModel: "ConversionRule",
                description: "Admin created a new conversion rule",
                after: newRule.toObject(),
            });
        }

        return response_handler(res, 201, "Conversion rule created successfully", newRule);
    } catch (error) {
        logger.error(`Error creating conversion rule: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "create_conversion_rule",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error creating conversion rule",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Update a conversion rule
 * @route PUT /api/v1/conversion/rules/:id
 */
exports.updateConversionRule = async (req, res) => {
    try {
        const rule = await ConversionRule.findById(req.params.id);

        if (!rule) {
            return response_handler(res, 404, "Conversion rule not found");
        }

        const originalRule = rule.toObject();

        // Update fields from request body
        const updateFields = [
            'name', 'description', 'conversionRate', 'minPointsRequired',
            'maxPointsPerConversion', 'bonusPercentage', 'startDate',
            'endDate', 'isActive'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                rule[field] = req.body[field];
            }
        });

        // Set updatedBy to current admin
        if (req.admin) {
            rule.updatedBy = req.admin._id;
        }

        await rule.save();

        // Log admin action
        if (req.admin) {
            await AuditService.logAdminAction({
                action: "update_conversion_rule",
                user: req.admin._id,
                userModel: "Admin",
                userName: req.admin.name,
                userEmail: req.admin.email,
                targetId: rule._id,
                targetModel: "ConversionRule",
                description: "Admin updated a conversion rule",
                before: originalRule,
                after: rule.toObject(),
            });
        }

        return response_handler(res, 200, "Conversion rule updated successfully", rule);
    } catch (error) {
        logger.error(`Error updating conversion rule: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "update_conversion_rule",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error updating conversion rule",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: { ruleId: req.params.id, ...req.body },
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Delete a conversion rule
 * @route DELETE /api/v1/conversion/rules/:id
 */
exports.deleteConversionRule = async (req, res) => {
    try {
        const rule = await ConversionRule.findById(req.params.id);

        if (!rule) {
            return response_handler(res, 404, "Conversion rule not found");
        }

        const originalRule = rule.toObject();

        await ConversionRule.findByIdAndDelete(req.params.id);

        // Log admin action
        if (req.admin) {
            await AuditService.logAdminAction({
                action: "delete_conversion_rule",
                user: req.admin._id,
                userModel: "Admin",
                userName: req.admin.name,
                userEmail: req.admin.email,
                targetId: req.params.id,
                targetModel: "ConversionRule",
                description: "Admin deleted a conversion rule",
                before: originalRule,
            });
        }

        return response_handler(res, 200, "Conversion rule deleted successfully");
    } catch (error) {
        logger.error(`Error deleting conversion rule: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "delete_conversion_rule",
            status: "failure",
            user: req.admin ? req.admin._id : null,
            userModel: "Admin",
            userName: req.admin ? req.admin.name : null,
            userEmail: req.admin ? req.admin.email : null,
            description: "Error deleting conversion rule",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: { ruleId: req.params.id },
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Calculate coins from points
 * @route POST /api/v1/conversion/calculate
 */
exports.calculateConversion = async (req, res) => {
    try {
        const { points, ruleId } = req.body;

        if (!points || points <= 0) {
            return response_handler(res, 400, "Points must be a positive number");
        }

        let rule;

        if (ruleId) {
            rule = await ConversionRule.findById(ruleId);
            if (!rule) {
                return response_handler(res, 404, "Conversion rule not found");
            }
            if (!rule.isCurrentlyActive()) {
                return response_handler(res, 400, "The selected conversion rule is not currently active");
            }
        } else {
            // Get the default active rule (first one)
            const activeRules = await ConversionRule.findActiveRules();
            if (!activeRules || activeRules.length === 0) {
                return response_handler(res, 404, "No active conversion rules found");
            }
            rule = activeRules[0];
        }

        // Check minimum points requirement
        if (points < rule.minPointsRequired) {
            return response_handler(res, 400, `Minimum ${rule.minPointsRequired} points required for conversion`);
        }

        // Check maximum points limit if set
        if (rule.maxPointsPerConversion > 0 && points > rule.maxPointsPerConversion) {
            return response_handler(res, 400, `Maximum ${rule.maxPointsPerConversion} points allowed per conversion`);
        }

        // Calculate conversion
        const result = ConversionRule.calculateCoins(points, rule);

        // Format the conversion rate as a string (e.g., "1:10")
        const conversionRate = `1:${rule.conversionRate}`;

        return response_handler(res, 200, "Conversion calculated successfully", {
            points,
            baseCoins: result.coins,
            bonusCoins: result.bonus,
            totalCoins: result.total,
            conversionRate,
            rule: {
                _id: rule._id,
                name: rule.name,
                conversionRate: rule.conversionRate,
                bonusPercentage: rule.bonusPercentage
            }
        });
    } catch (error) {
        logger.error(`Error calculating conversion: ${error.message}`, {
            stack: error.stack,
        });

        // Log error to audit
        await AuditService.logError({
            action: "calculate_conversion",
            status: "failure",
            user: req.user ? req.user._id : null,
            userModel: req.user ? "User" : null,
            userName: req.user ? req.user.name : null,
            userEmail: req.user ? req.user.email : null,
            description: "Error calculating points to coins conversion",
            errorMessage: error.message,
            stackTrace: error.stack,
            details: req.body,
        });

        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 