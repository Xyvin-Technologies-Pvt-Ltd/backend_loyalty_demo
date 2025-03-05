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
const { auditRoutes } = require('../modules/audit');
const { themeSettingsRoutes } = require('../modules/theme_settings');
const { conversionRoutes, conversionRuleRoutes } = require('../modules/conversion');
const app_type_routes = require('../modules/app_types/app_type.routes');
const trigger_event_routes = require('../modules/trigger_event/trigger_event.routes');
const trigger_services_routes = require('../modules/trigger_services/trigger_services.routes');

/**
 * Register all application routes
 * @param {Object} app - Express application
 * @param {String} basePath - Base path for API routes
 */
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
    app.use(`${basePath}/point-criteria`, point_criteria_routes);
    app.use(`${basePath}/roles`, role_routes);
    app.use(`${basePath}/redemption-rules`, redemption_rules_routes);
    app.use(`${basePath}/points-expiration`, points_expiration_routes);
    app.use(`${basePath}/app-types`, app_type_routes);
    app.use(`${basePath}/trigger-events`, trigger_event_routes);
    app.use(`${basePath}/trigger-services`, trigger_services_routes);


    // SDK routes
    app.use(`${basePath}/sdk/access-keys`, sdkAccessKeyRoutes);
    app.use(`${basePath}/sdk/api`, sdkApiRoutes);

    // Audit routes
    app.use(`${basePath}/audit`, auditRoutes);

    // Theme settings routes
    app.use(`${basePath}/theme-settings`, themeSettingsRoutes);

    // Conversion routes
    app.use(`${basePath}/conversion`, conversionRoutes);
    app.use(`${basePath}/conversion/rules`, conversionRuleRoutes);
}

module.exports = registerRoutes; 