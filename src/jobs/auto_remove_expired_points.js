const cron = require("node-cron");
const LoyaltyPoints = require("../models/loyalty_points_model");
cron.schedule("0 0 * * *", async () => {
  await LoyaltyPoints.deleteMany({ expiryDate: { $lt: new Date() } });
  console.log("Expired loyalty points removed.");
});
