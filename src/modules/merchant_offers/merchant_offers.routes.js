const express = require('express');
const router = express.Router();
const merchant_offers_controller = require('./merchant_offers.controller');
const { authorizePermission } = require('../../middlewares/auth/auth');
const { createAuditMiddleware } = require('../audit');
const { cacheInvalidationMiddleware } = require('../../middlewares/redis_cache/cache_invalidation.middleware');
const { cacheMiddleware, cacheKeys } = require('../../middlewares/redis_cache/cache.middleware');
const validators = require('./merchant_offers.validators');

// Create audit middleware for the merchant_offers module
const couponAudit = createAuditMiddleware('merchant_offers');

// Merchant routes for coupon management
router.post('/pre-generated',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('create_coupon', {
        description: 'Admin created pre-generated coupons',
        targetModel: 'CouponCode',
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allCoupons, cacheKeys.couponByCode),
    merchant_offers_controller.createPreGeneratedCoupons
);

router.post('/dynamic',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('create_dynamic_coupon', {
        description: 'Admin created a dynamic coupon',
        targetModel: 'CouponCode',
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allCoupons, cacheKeys.couponByCode),
    merchant_offers_controller.generateDynamicCoupon
);

router.post('/one-time-link',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('create_one_time_link', {
        description: 'Admin created a one-time link coupon',
        targetModel: 'CouponCode',
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allCoupons, cacheKeys.couponByCode),
    merchant_offers_controller.createOneTimeLink
);

router.post('/validate',
    authorizePermission('MANAGE_COUPONS', 'USE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('validate_coupon', {
        description: 'User validated a coupon',
        targetModel: 'CouponCode',
        details: req => req.body,
        getModifiedData: (req, res) => {
            if (res.locals.responseBody && res.locals.responseBody.data) {
                return res.locals.responseBody.data;
            }
            return null;
        }
    }),
    cacheInvalidationMiddleware(cacheKeys.allCoupons, cacheKeys.couponByCode),
    merchant_offers_controller.validateCoupon
);

router.post('/check-eligibility',
    authorizePermission('MANAGE_COUPONS', 'USE_COUPONS'),
    couponAudit.adminAction('check_coupon_eligibility', {
        description: 'User checked eligibility for a coupon',
        targetModel: 'CouponCode',
        details: req => req.body
    }),
    merchant_offers_controller.checkEligibility
);

router.get('/',
    authorizePermission('MANAGE_COUPONS', 'VIEW_COUPONS'),
    couponAudit.adminAction('list_coupons', {
        description: 'User viewed all coupons',
        targetModel: 'CouponCode'
    }),
    cacheMiddleware(60, cacheKeys.allCoupons),
    merchant_offers_controller.listCoupons
);

router.get('/:code',
    authorizePermission('MANAGE_COUPONS', 'VIEW_COUPONS'),
    couponAudit.adminAction('view_coupon', {
        description: 'User viewed a coupon',
        targetModel: 'CouponCode',
        targetId: req => req.params.code
    }),
    cacheMiddleware(60, cacheKeys.couponByCode),
    merchant_offers_controller.getCouponDetails
);

module.exports = router;
