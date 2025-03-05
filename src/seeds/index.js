const mongoose = require("mongoose");
const { logger } = require("../middlewares/logger");
const seedRedemptionRules = require("./redemption_rules_seed");
const seedTransactions = require("./transaction_seed");
const seedPointsExpirationRules = require("./points_expiration_rules_seed");
const seedRoles = require("./role_seed");
const seedSDKAccessKeys = require("./sdk_access_key_seed");
const seedAuditPermissions = require("./audit_permissions_seed");
const seedThemeSettings = require("./theme_settings_seed");
const seedConversionRules = require("./conversion_rule_seed");
const seedTiers = require("./tier_seed");
// Import new seed functions
const seedAppTypes = require("./app_type_seed");
const seedTriggerEvents = require("./trigger_event_seed");
const seedTriggerServices = require("./trigger_services_seed");
const seedPointsCriteria = require("./point_criteria_seed");

/**
 * Run all seed functions
 */
async function runSeeds() {
  try {
    logger.info("Starting database seeding...");

    // Add all seed functions here
    await seedRoles(); // Seed roles first as they may be referenced by other entities
    await seedAuditPermissions(); // Add audit permissions to roles
    await seedRedemptionRules();
    await seedPointsExpirationRules();
    await seedTransactions();
    await seedSDKAccessKeys();
    await seedThemeSettings(); // Seed default theme settings
    await seedConversionRules(); // Seed default conversion rules
    await seedTiers();

    // New seed functions - order matters due to dependencies
    await seedAppTypes(); // Seed app types first
    await seedTriggerEvents(); // Seed trigger events next
    await seedTriggerServices(); // Seed trigger services (depends on trigger events)
    await seedPointsCriteria(); // Seed point criteria (depends on all the above)

    logger.info("Database seeding completed successfully");
  } catch (error) {
    logger.error(`Error during database seeding: ${error.message}`, {
      stack: error.stack,
    });
  }
}

// Export the function to be called from elsewhere
module.exports = runSeeds;
