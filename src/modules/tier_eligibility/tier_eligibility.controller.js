const TierEligibilityCriteria = require("../../models/tier_eligibility_criteria_model");
const Tier = require("../../models/tier_model");
const AppType = require("../../models/app_type_model");
const response_handler = require("../../helpers/response_handler");
const { logger } = require("../../middlewares/logger");

/**
 * Create new tier eligibility criteria
 */
const createTierEligibilityCriteria = async (req, res) => {
    try {
        const {
            tier_id,
            net_earning_required,
            evaluation_period_days,
            consecutive_periods_required,
            app_type,
            settings
        } = req.body;
        console.log("req.body", req.body);

       

        // Check if tier exists
        const tier = await Tier.findById(tier_id);
        if (!tier) {
            return response_handler(res, 404, "Tier not found");
        }

        // Check if app_type exists (if provided)
        if (app_type) {
            const appTypeExists = await AppType.findById(app_type);
            if (!appTypeExists) {
                return response_handler(res, 404, "App type not found");
            }
        }

        // Check if criteria already exists for this tier and app_type combination
        const existingCriteria = await TierEligibilityCriteria.findOne({
            tier_id,
            app_type: app_type || null
        });

        if (existingCriteria) {
            return response_handler(res, 400, "Eligibility criteria already exists for this tier and app type combination");
        }

        // Create new criteria
        const newCriteria = await TierEligibilityCriteria.create({
            tier_id,
            net_earning_required,
            evaluation_period_days,
            consecutive_periods_required,
            app_type: app_type || null,
            settings: settings || {
                require_consecutive: true,
                grace_periods_allowed: 0
            },
            created_by: req.user?.id
        });

        await newCriteria.populate([
            { path: 'tier_id', select: 'name points_required' },
            { path: 'app_type', select: 'name' }
        ]);

        logger.info("Tier eligibility criteria created", {
            criteria_id: newCriteria._id,
            tier: tier.name,
            created_by: req.user?.id
        });

        return response_handler(res, 201, "Tier eligibility criteria created successfully", newCriteria);

    } catch (error) {
        logger.error(`Error creating tier eligibility criteria: ${error.message}`, {
            stack: error.stack,
            body: req.body,
        });
        return response_handler(res, 500, "Internal server error");
    }
};

/**
 * Get all tier eligibility criteria
 */
const getAllTierEligibilityCriteria = async (req, res) => {
    try {
        const { page = 1, limit = 10, tier_id, app_type, is_active } = req.query;

        const filter = {};
        if (tier_id) filter.tier_id = tier_id;
        if (app_type) filter.app_type = app_type;
        if (is_active !== undefined) filter.is_active = is_active === 'true';

        const skip = (page - 1) * limit;

        const criteria = await TierEligibilityCriteria.find(filter)
            .populate([
                { path: 'tier_id', select: 'name points_required' },
                { path: 'app_type', select: 'name' },
                { path: 'created_by', select: 'name email' },
                { path: 'updated_by', select: 'name email' }
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TierEligibilityCriteria.countDocuments(filter);

        const responseData = {
            criteria,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_count: total,
                per_page: parseInt(limit),
            }
        };

        return response_handler(res, 200, "Tier eligibility criteria retrieved successfully", responseData);

    } catch (error) {
        logger.error(`Error retrieving tier eligibility criteria: ${error.message}`, {
            stack: error.stack,
            query: req.query,
        });
        return response_handler(res, 500, "Internal server error");
    }
};

/**
 * Get tier eligibility criteria by ID
 */
const getTierEligibilityCriteriaById = async (req, res) => {
    try {
        const { id } = req.params;

        const criteria = await TierEligibilityCriteria.findById(id)
            .populate([
                { path: 'tier_id', select: 'name points_required' },
                { path: 'app_type', select: 'name' },
                { path: 'created_by', select: 'name email' },
                { path: 'updated_by', select: 'name email' }
            ]);

        if (!criteria) {
            return response_handler(res, 404, "Tier eligibility criteria not found");
        }

        return response_handler(res, 200, "Tier eligibility criteria retrieved successfully", criteria);

    } catch (error) {
        logger.error(`Error retrieving tier eligibility criteria: ${error.message}`, {
            stack: error.stack,
            params: req.params,
        });
        return response_handler(res, 500, "Internal server error");
    }
};

/**
 * Update tier eligibility criteria
 */
const updateTierEligibilityCriteria = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            net_earning_required,
            evaluation_period_days,
            consecutive_periods_required,
            app_type,
            is_active,
            settings
        } = req.body;

        const criteria = await TierEligibilityCriteria.findById(id);
        if (!criteria) {
            return response_handler(res, 404, "Tier eligibility criteria not found");
        }

        // Check if app_type exists (if provided)
        if (app_type) {
            const appTypeExists = await AppType.findById(app_type);
            if (!appTypeExists) {
                return response_handler(res, 404, "App type not found");
            }
        }

        // Update fields
        const updateData = {
            updated_by: req.user?.id
        };

        if (net_earning_required !== undefined) updateData.net_earning_required = net_earning_required;
        if (evaluation_period_days !== undefined) updateData.evaluation_period_days = evaluation_period_days;
        if (consecutive_periods_required !== undefined) updateData.consecutive_periods_required = consecutive_periods_required;
        if (app_type !== undefined) updateData.app_type = app_type || null;
        if (is_active !== undefined) updateData.is_active = is_active;
        if (settings !== undefined) updateData.settings = { ...criteria.settings, ...settings };

        const updatedCriteria = await TierEligibilityCriteria.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate([
            { path: 'tier_id', select: 'name points_required' },
            { path: 'app_type', select: 'name' },
            { path: 'updated_by', select: 'name email' }
        ]);

        logger.info("Tier eligibility criteria updated", {
            criteria_id: id,
            updated_by: req.user?.id
        });

        return response_handler(res, 200, "Tier eligibility criteria updated successfully", updatedCriteria);

    } catch (error) {
        logger.error(`Error updating tier eligibility criteria: ${error.message}`, {
            stack: error.stack,
            params: req.params,
            body: req.body,
        });
        return response_handler(res, 500, "Internal server error");
    }
};

/**
 * Delete tier eligibility criteria
 */
const deleteTierEligibilityCriteria = async (req, res) => {
    try {
        const { id } = req.params;

        const criteria = await TierEligibilityCriteria.findById(id);
        if (!criteria) {
            return response_handler(res, 404, "Tier eligibility criteria not found");
        }

        await TierEligibilityCriteria.findByIdAndDelete(id);

        logger.info("Tier eligibility criteria deleted", {
            criteria_id: id,
            deleted_by: req.user?.id
        });

        return response_handler(res, 200, "Tier eligibility criteria deleted successfully");

    } catch (error) {
        logger.error(`Error deleting tier eligibility criteria: ${error.message}`, {
            stack: error.stack,
            params: req.params,
        });
        return response_handler(res, 500, "Internal server error");
    }
};

/**
 * Get criteria for a specific tier
 */
const getCriteriaForTier = async (req, res) => {
    try {
        const { tier_id } = req.params;
        const { app_type } = req.query;

        const tier = await Tier.findById(tier_id);
        if (!tier) {
            return response_handler(res, 404, "Tier not found");
        }

        const criteria = await TierEligibilityCriteria.getCriteriaForTier(
            tier_id,
            app_type || null
        );

        if (!criteria) {
            return response_handler(res, 404, "No eligibility criteria found for this tier");
        }

        await criteria.populate([
            { path: 'tier_id', select: 'name points_required' },
            { path: 'app_type', select: 'name' }
        ]);

        return response_handler(res, 200, "Tier eligibility criteria retrieved successfully", criteria);

    } catch (error) {
        logger.error(`Error retrieving criteria for tier: ${error.message}`, {
            stack: error.stack,
            params: req.params,
            query: req.query,
        });
        return response_handler(res, 500, "Internal server error");
    }
};

module.exports = {
    createTierEligibilityCriteria,
    getAllTierEligibilityCriteria,
    getTierEligibilityCriteriaById,
    updateTierEligibilityCriteria,
    deleteTierEligibilityCriteria,
    getCriteriaForTier
}; 