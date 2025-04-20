const express = require('express');
const router = express.Router();
const merchant_offers_controller = require('./merchant_offers.controller');
const { authorizePermission } = require('../../middlewares/auth/auth');
const { createAuditMiddleware } = require('../audit');
const { cacheInvalidationMiddleware } = require('../../middlewares/redis_cache/cache_invalidation.middleware');
const { cacheMiddleware, cacheKeys } = require('../../middlewares/redis_cache/cache.middleware');

// Create audit middleware for the merchant_offers module
const couponAudit = createAuditMiddleware('merchant_offers');





// Create a single coupon
router.post('/create',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('create_coupon', {
        description: 'Admin created a coupon',
        targetModel: 'CouponCode',
        details: req => req.body
    }),
    cacheInvalidationMiddleware(cacheKeys.ALL_COUPONS),
    merchant_offers_controller.createCoupon
);

// Create bulk coupons with pre-generated codes
router.post('/bulk-create',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('create_bulk_coupons', {
        description: 'Admin created bulk coupons',
        targetModel: 'CouponCode',
        details: req => req.body
    }),
    cacheInvalidationMiddleware(cacheKeys.ALL_COUPONS),
    merchant_offers_controller.createBulkCoupons
);

// Create a one-time link coupon
router.post('/create-link',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('create_one_time_link_coupon', {
        description: 'Admin created a one-time link coupon',
        targetModel: 'CouponCode',
        details: req => req.body
    }),
    cacheInvalidationMiddleware(cacheKeys.ALL_COUPONS),
    merchant_offers_controller.createOneTimeLinkCoupon
);

// Get coupons by batch ID
router.get('/batch/:batchId',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.adminAction('get_coupons_by_batch', {
        description: 'User viewed coupons by batch ID',
        targetModel: 'CouponCode',
        targetId: req => req.params.batchId
    }),
    cacheMiddleware(cacheKeys.COUPONS_BY_BATCH, req => req.params.batchId),
    merchant_offers_controller.getCouponsByBatch
);

// Get coupon details by ID
router.get('/:couponId',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.adminAction('get_coupon_details', {
        description: 'User viewed coupon details',
        targetModel: 'CouponCode',
        targetId: req => req.params.couponId
    }),
    cacheMiddleware(cacheKeys.COUPON_DETAILS, req => req.params.couponId),
    merchant_offers_controller.getCouponDetails
);


// Get all coupons
router.get('/',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.adminAction('get_all_coupons', {
        description: 'User viewed all coupons',
        targetModel: 'CouponCode'
    }),
    // cacheMiddleware(cacheKeys.ALL_COUPONS),
    merchant_offers_controller.getAllCoupons
);

// Update coupon details
router.put('/:couponId',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('update_coupon', {
        description: 'Admin updated coupon details',
        targetModel: 'CouponCode',
        targetId: req => req.params.couponId,
        details: req => req.body
    }),
    cacheInvalidationMiddleware(cacheKeys.COUPON_DETAILS, req => req.params.couponId),
    merchant_offers_controller.updateCoupon
);

// Delete coupon
router.delete('/:couponId',
    authorizePermission('MANAGE_COUPONS'),
    couponAudit.captureResponse(),
    couponAudit.adminAction('delete_coupon', {
        description: 'Admin deleted a coupon',
        targetModel: 'CouponCode',
        targetId: req => req.params.couponId
    }),
    cacheInvalidationMiddleware(cacheKeys.COUPON_DETAILS, req => req.params.couponId),
    merchant_offers_controller.deleteCoupon
);  





module.exports = router;
