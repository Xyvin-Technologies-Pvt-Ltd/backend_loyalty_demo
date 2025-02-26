require("dotenv").config();
const express = require("express");
const cors = require("cors");
const clc = require("cli-color");
const response_handler = require("./src/helpers/response_handler");
const {
  request_logger,
  error_logger,
  logger,
} = require("./src/middlewares/logger");
const {
  swaggerUi,
  swagger_spec,
  swagger_options,
} = require("./src/swagger/swagger");
const auth_routes = require("./src/modules/auth/auth.routes");
const log_routes = require("./src/modules/log/log.routes");
const tier_routes = require("./src/modules/tier/tier.routes");
const point_criteria_routes = require("./src/modules/point_criteria/point_criteria.routes");

//! Create an instance of the Express application
const app = express();

//* Define the PORT & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;

//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

//* Parse JSON request bodies
app.use(express.json());

//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;

//* Import database connection module
require("./src/helpers/connection");

//! Apply request logging middleware
app.use(request_logger);

//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  logger.info("API root accessed", { endpoint: BASE_PATH });
  return response_handler(
    res,
    200,
    "🔐 Access point secured! Only those with the key may proceed. Do you dare to unlock the secrets within? 🚀"
  );
});

//* Swagger setup
app.use(
  `${BASE_PATH}/api-docs`,
  (req, res, next) => {
    logger.info("Swagger UI accessed", { endpoint: `${BASE_PATH}/api-docs` });
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swagger_spec, swagger_options)
);

//* Configure routes for user API
app.use(`${BASE_PATH}/auth`, auth_routes);
app.use(`${BASE_PATH}/logs`, log_routes);
app.use(`${BASE_PATH}/tier`, tier_routes);
app.use(`${BASE_PATH}/point-criteria`, point_criteria_routes);

//! Apply error logging middleware
app.use(error_logger);

//! Handle uncaught exceptions globally
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

//! Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
});

//! Start the server
app.listen(PORT, () => {
  const port_message = clc.redBright(`✓ App is running on port: ${PORT}`);
  const env_message = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  const status_message = clc.greenBright(
    "✓ Server is up and running smoothly 🚀"
  );

  logger.info(
    `Server started on port ${PORT} in ${NODE_ENV || "development"} mode`
  );

  console.log(`${port_message}\n${env_message}\n${status_message}`);
});
