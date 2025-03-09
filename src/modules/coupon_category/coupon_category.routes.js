const express = require("express");
const router = express.Router();
const {
  createCouponCategory,
  getAllCouponCategories,
  getCouponCategoryById,
  updateCouponCategory,
  deleteCouponCategory,
} = require("./coupon_category.controllers");
const { authorizePermission } = require("../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../audit");

const couponCategoryAudit = createAuditMiddleware("coupon_category");

router.post(
  "/",
  authorizePermission("CREATE_COUPON_CATEGORY"),
  couponCategoryAudit.captureResponse(),
  couponCategoryAudit.adminAction("create_coupon_category", {
    description: "Admin created a coupon category",
    targetModel: "CouponCategory",
  }),
  createCouponCategory
);
router.get(
  "/",
  authorizePermission("VIEW_COUPON_CATEGORIES"),
  couponCategoryAudit.captureResponse(),
  couponCategoryAudit.adminAction("view_coupon_categories", {
    description: "Admin viewed all coupon categories",
    targetModel: "CouponCategory",
  }),
  getAllCouponCategories
);

router.get(
  "/:id",
  authorizePermission("VIEW_COUPON_CATEGORY"),
  couponCategoryAudit.captureResponse(),
  couponCategoryAudit.adminAction("view_coupon_category", {
    description: "Admin viewed a coupon category",
    targetModel: "CouponCategory",
  }),
  getCouponCategoryById
);

router.put(
  "/:id",
  authorizePermission("UPDATE_COUPON_CATEGORY"),
  couponCategoryAudit.captureResponse(),
  couponCategoryAudit.adminAction("update_coupon_category", {
    description: "Admin updated a coupon category",
    targetModel: "CouponCategory",
  }),
  updateCouponCategory
);

router.delete(
  "/:id",
  authorizePermission("DELETE_COUPON_CATEGORY"),
  couponCategoryAudit.captureResponse(),
  couponCategoryAudit.adminAction("delete_coupon_category", {
    description: "Admin deleted a coupon category",
    targetModel: "CouponCategory",
  }),
  deleteCouponCategory
);

module.exports = router;
