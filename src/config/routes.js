/**
 * Routes configuration
 * Registers all application routes with the Express app
 */

const { logger } = require('../middlewares/logger');
const response_handler = require('../helpers/response_handler');
const { swaggerUi, swagger_spec, swagger_options } = require('../swagger/swagger');

// Import route modules
const auth_routes = require('../modules/auth/auth.routes');
const log_routes = require('../modules/log/log.routes');
const tier_routes = require('../modules/tier/tier.routes');
const point_criteria_routes = require('../modules/point_criteria/point_criteria.routes');
const role_routes = require('../modules/role/role.routes');
const redemption_rules_routes = require('../modules/redemption_rules/redemption_rules.routes');
const points_expiration_routes = require('../modules/points_expiration/points_expiration.routes');
const { sdkAccessKeyRoutes, sdkApiRoutes } = require('../modules/sdk');
const auditRoutes  = require('../modules/audit/routes/audit.routes');
const { themeSettingsRoutes } = require('../modules/theme_settings');
const app_type_routes = require('../modules/app_types/app_type.routes');
const trigger_event_routes = require('../modules/trigger_event/trigger_event.routes');
const trigger_services_routes = require('../modules/trigger_services/trigger_services.routes');
const coin_management_routes = require('../modules/coin_convertion_rule/coin_management.routes');
const referral_program_entry_routes = require('../modules/referral_program_entry/referral_program.routes');
const referral_program_rules_routes = require('../modules/referral_program_rules/refferal_program_rules.routes');
const transaction_routes = require('../modules/transaction/transaction.routes');
const customer_routes = require('../modules/customer/customer.routes');




function registerRoutes(app, basePath) {
    // Define a route for the API root
    app.get(basePath, (req, res) => {
        logger.info('API root accessed', { endpoint: basePath });
        return response_handler(
            res,
            200,
            '🔐 Access point secured! Only those with the key may proceed. Do you dare to unlock the secrets within? 🚀'
        );
    });

    // Swagger setup
    app.use(
        `${basePath}/api-docs`,
        (req, res, next) => {
            logger.info('Swagger UI accessed', { endpoint: `${basePath}/api-docs` });
            next();
        },
        swaggerUi.serve,
        swaggerUi.setup(swagger_spec, swagger_options)
    );

    // Register module routes
    app.use(`${basePath}/auth`, auth_routes);
    app.use(`${basePath}/logs`, log_routes);
    app.use(`${basePath}/tier`, tier_routes);
    app.use(`${basePath}/points-criteria`, point_criteria_routes);
    app.use(`${basePath}/role-settings`, role_routes);
    app.use(`${basePath}/redemption-rules`, redemption_rules_routes);
    app.use(`${basePath}/point-expiry-rules`, points_expiration_routes);
    app.use(`${basePath}/app-types`, app_type_routes);
    app.use(`${basePath}/trigger-events`, trigger_event_routes);
    app.use(`${basePath}/trigger-services`, trigger_services_routes);
    app.use(`${basePath}/coin-management`, coin_management_routes);
    app.use(`${basePath}/referral-program-entry`, referral_program_entry_routes);
    app.use(`${basePath}/referral-program-rules`, referral_program_rules_routes);
    app.use(`${basePath}/transaction`, transaction_routes);
    app.use(`${basePath}/customer`, customer_routes);

    // SDK routes
    app.use(`${basePath}/sdk/access-keys`, sdkAccessKeyRoutes);
    app.use(`${basePath}/sdk/api`, sdkApiRoutes);

    // Audit routes
    app.use(`${basePath}/audit`, auditRoutes);

    // Theme settings routes
    app.use(`${basePath}/theme-settings`, themeSettingsRoutes);

}

module.exports = registerRoutes; 