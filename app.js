require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const response_handler = require("./src/helpers/response_handler");
const { request_logger, error_logger } = require("./src/middlewares/logger");

//! Create an instance of the Express application
const app = express();
//* Define the PORT & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;
//* Use volleyball for request logging
app.use(volleyball);
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
  return response_handler(
    res,
    200,
    "🔐 Access point secured! Only those with the key may proceed. Do you dare to unlock the secrets within? 🚀"
  );
});

//! Apply error logging middleware
app.use(error_logger);

app.listen(PORT, () => {
  const port_message = clc.redBright(`✓ App is running on port: ${PORT}`);
  const env_message = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  const status_message = clc.greenBright(
    "✓ Server is up and running smoothly 🚀"
  );

  console.log(`${port_message}\n${env_message}\n${status_message}`);
});
