const express = require('express');
const router = express.Router();
const conversionRuleController = require('../controllers/conversion_rule.controller');
const { protect } = require('../../../middlewares/protect');
const { authorize } = require('../../../middlewares/auth');
const { validate } = require('../../../middlewares/validate');
const {
    createConversionRuleValidator,
    updateConversionRuleValidator
} = require('../validators/conversion.validator');
const { createAuditMiddleware } = require('../../audit');

// Create audit middleware for the conversion module
const conversionAudit = createAuditMiddleware('conversion');

// All routes require authentication
router.use(protect);

// Get all conversion rules (admin only)
router.get(
    '/',
    authorize('MANAGE_CONVERSION_RULES'),
    conversionAudit.adminAction('view_conversion_rules', {
        description: 'Admin viewed all conversion rules',
        details: req => ({
            filters: req.query
        })
    }),
    conversionRuleController.getAllConversionRules
);

// Get active conversion rules (accessible to users and admins)
router.get(
    '/active',
    conversionAudit.dataAccess('view_active_conversion_rules', {
        description: 'User viewed active conversion rules'
    }),
    conversionRuleController.getActiveConversionRules
);

// Get conversion rule by ID (admin only)
router.get(
    '/:id',
    authorize('MANAGE_CONVERSION_RULES'),
    conversionAudit.adminAction('view_conversion_rule', {
        targetModel: 'ConversionRule',
        description: 'Admin viewed a conversion rule',
        targetId: req => req.params.id
    }),
    conversionRuleController.getConversionRuleById
);

// Create a new conversion rule (admin only)
router.post(
    '/',
    authorize('MANAGE_CONVERSION_RULES'),
    validate(createConversionRuleValidator),
    conversionAudit.captureResponse(),
    conversionAudit.dataModification('create_conversion_rule', {
        targetModel: 'ConversionRule',
        description: 'Admin created a new conversion rule',
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    conversionRuleController.createConversionRule
);

// Update a conversion rule (admin only)
router.put(
    '/:id',
    authorize('MANAGE_CONVERSION_RULES'),
    validate(updateConversionRuleValidator),
    conversionAudit.captureResponse(),
    conversionAudit.dataModification('update_conversion_rule', {
        targetModel: 'ConversionRule',
        description: 'Admin updated a conversion rule',
        targetId: req => req.params.id,
        details: req => req.body,
        getOriginalData: async req => {
            const ConversionRule = require('../../../models/conversion_rule.model');
            const rule = await ConversionRule.findById(req.params.id);
            return rule ? rule.toObject() : null;
        },
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    conversionRuleController.updateConversionRule
);

// Delete a conversion rule (admin only)
router.delete(
    '/:id',
    authorize('MANAGE_CONVERSION_RULES'),
    conversionAudit.dataModification('delete_conversion_rule', {
        targetModel: 'ConversionRule',
        description: 'Admin deleted a conversion rule',
        targetId: req => req.params.id,
        getOriginalData: async req => {
            const ConversionRule = require('../../../models/conversion_rule.model');
            const rule = await ConversionRule.findById(req.params.id);
            return rule ? rule.toObject() : null;
        }
    }),
    conversionRuleController.deleteConversionRule
);

module.exports = router; 