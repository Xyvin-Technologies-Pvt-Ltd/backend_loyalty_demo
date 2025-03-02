const express = require('express');
const router = express.Router();
const conversionHistoryController = require('../controllers/conversion_history.controller');
const conversionRuleController = require('../controllers/conversion_rule.controller');
const { protect } = require('../../../middlewares/protect');
const { authorize } = require('../../../middlewares/auth');
const { validate } = require('../../../middlewares/validate');
const {
    calculateConversionValidator,
    convertPointsValidator,
    getConversionHistoryValidator
} = require('../validators/conversion.validator');
const { createAuditMiddleware } = require('../../audit');

// Create audit middleware for the conversion module
const conversionAudit = createAuditMiddleware('conversion');

// All routes require authentication
router.use(protect);

// Calculate conversion (preview) - accessible to users
router.post(
    '/calculate',
    validate(calculateConversionValidator),
    conversionAudit.dataAccess('calculate_conversion', {
        description: 'User calculated points to coins conversion',
        details: req => ({
            points: req.body.points,
            ruleId: req.body.ruleId
        })
    }),
    conversionRuleController.calculateConversion
);

// Convert points to coins - accessible to users
router.post(
    '/convert',
    validate(convertPointsValidator),
    conversionAudit.dataModification('convert_points_to_coins', {
        targetModel: 'ConversionHistory',
        description: 'User converted points to coins',
        details: req => ({
            points: req.body.points,
            ruleId: req.body.ruleId
        }),
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    conversionAudit.captureResponse(),
    conversionHistoryController.convertPointsToCoins
);

// Get conversion history for current user
router.get(
    '/history/my',
    validate(getConversionHistoryValidator),
    conversionAudit.dataAccess('view_conversion_history', {
        description: 'User viewed their conversion history',
        details: req => ({
            filters: req.query
        })
    }),
    (req, res, next) => {
        // Set the userId param to the current user's ID
        req.params.userId = req.user._id;
        next();
    },
    conversionHistoryController.getUserConversionHistory
);

// Get conversion history for a specific user (admin only)
router.get(
    '/history/user/:userId',
    authorize('VIEW_USER_HISTORY'),
    validate(getConversionHistoryValidator),
    conversionAudit.adminAction('view_user_conversion_history', {
        description: 'Admin viewed a user\'s conversion history',
        targetId: req => req.params.userId,
        targetModel: 'User',
        details: req => ({
            filters: req.query
        })
    }),
    conversionHistoryController.getUserConversionHistory
);

// Get all conversion history (admin only)
router.get(
    '/history',
    authorize('VIEW_ALL_HISTORY'),
    validate(getConversionHistoryValidator),
    conversionAudit.adminAction('view_all_conversion_history', {
        description: 'Admin viewed all conversion history',
        details: req => ({
            filters: req.query
        })
    }),
    conversionHistoryController.getAllConversionHistory
);

// Get conversion history by ID (admin only)
router.get(
    '/history/:id',
    authorize('VIEW_ALL_HISTORY'),
    conversionAudit.adminAction('view_conversion_history_detail', {
        description: 'Admin viewed conversion history details',
        targetId: req => req.params.id,
        targetModel: 'ConversionHistory'
    }),
    conversionHistoryController.getConversionHistoryById
);

module.exports = router; 