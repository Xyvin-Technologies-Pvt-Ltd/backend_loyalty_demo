const express = require("express");
const router = express.Router();
const {
  createCouponBrand,
  getAllCouponBrands,
  getCouponBrandById,
  updateCouponBrand,
  deleteCouponBrand,
} = require("./coupon_brand.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");
const { cacheInvalidationMiddleware } = require("../../middlewares/redis_cache/cache_invalidation.middleware");
const { cacheMiddleware, cacheKeys } = require("../../middlewares/redis_cache/cache.middleware");

const couponBrandAudit = createAuditMiddleware("coupon_brand");

router.post(
  "/",
  authorizePermission("CREATE_COUPON_BRAND"),
  couponBrandAudit.captureResponse(),
  couponBrandAudit.adminAction("create_coupon_brand", {
    description: "Admin created a coupon brand",
    targetModel: "CouponBrand",
  }),
  cacheInvalidationMiddleware(cacheKeys.allCouponBrands),
  createCouponBrand
);

router.get(
  "/",
  authorizePermission("VIEW_COUPON_BRANDS"),
  couponBrandAudit.captureResponse(),
  couponBrandAudit.adminAction("view_coupon_brands", {
    description: "Admin viewed all coupon brands",
    targetModel: "CouponBrand",
  }),
  cacheMiddleware(60, cacheKeys.allCouponBrands),
  getAllCouponBrands
);

router.get(
  "/:id",
  authorizePermission("VIEW_COUPON_BRAND"),
  couponBrandAudit.captureResponse(),
  couponBrandAudit.adminAction("view_coupon_brand", {
    description: "Admin viewed a coupon brand",
    targetModel: "CouponBrand",
  }),
  cacheMiddleware(60, cacheKeys.couponBrandById),
  getCouponBrandById
);

router.put(
  "/:id",
  authorizePermission("UPDATE_COUPON_BRAND"),
  couponBrandAudit.captureResponse(),
  couponBrandAudit.adminAction("update_coupon_brand", {
    description: "Admin updated a coupon brand",
    targetModel: "CouponBrand",
  }),
  cacheInvalidationMiddleware(cacheKeys.allCouponBrands, cacheKeys.couponBrandById),
  updateCouponBrand
);

router.delete(
  "/:id",
  authorizePermission("DELETE_COUPON_BRAND"),
  couponBrandAudit.captureResponse(),
  couponBrandAudit.adminAction("delete_coupon_brand", {
    description: "Admin deleted a coupon brand",
    targetModel: "CouponBrand",
  }),
  cacheInvalidationMiddleware(cacheKeys.allCouponBrands, cacheKeys.couponBrandById),
  deleteCouponBrand
);

module.exports = router;
