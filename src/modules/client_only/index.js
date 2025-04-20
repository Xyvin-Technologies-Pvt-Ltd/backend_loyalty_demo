const express = require("express");
const router = express.Router();
const customerRoutes = require("./customer/customer.routes");
const pointCriteriaRoutes = require("./point_criteria/point_criteria.routes");
const loyaltyPointsRoutes = require("./loyalty_points/loyalty_points.routes");
const coinsRoutes = require("./coins/coins.routes");
const offersRoutes = require("./offers/offers.route");
const merchantOffersRoutes = require("./merchant_offers/merchant_offers.routes");
const supportRoutes = require("./support_tickets/support_tickets.routes");
const themeSettingsRoutes = require("./theme_settings/theme_settings.routes");




router.use("/customer", customerRoutes);
router.use("/point-criteria", pointCriteriaRoutes);
router.use("/loyalty-points", loyaltyPointsRoutes);
router.use("/coins", coinsRoutes);
router.use("/offers", offersRoutes);
router.use("/merchant-offers", merchantOffersRoutes);
router.use("/support", supportRoutes);
router.use("/theme-settings", themeSettingsRoutes);

module.exports = router;
