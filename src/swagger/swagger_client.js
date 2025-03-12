const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { PORT, API_VERSION } = process.env;

const swagger_sdk_definition = {
  openapi: "3.0.0",
  info: {
    title: "Loyalty SDK API Documentation",
    version: "1.0.0",
    description: "API documentation for clients integrating with the Loyalty SDK",
    contact: {
      name: "Support Team",
      email: "support@xyvin.com",
      url: "https://xyvin.com",
    },
  },
  servers: [
    {
      url: `https://api-loyalty.xyvin.com/api/${API_VERSION}/sdk`,
      description: "SDK Staging Server",
    },
    {
      url: `http://localhost:${PORT}/api/${API_VERSION}/sdk`,
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "sdk-api-key",
        description: "API Key required for SDK authentication",
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
};

const sdk_options = {
  swaggerDefinition: swagger_sdk_definition,
  apis: ["./src/swagger/sdk_paths/*.js"], // SDK-specific API definitions
};

const sdk_swagger_spec = swaggerJSDoc(sdk_options);
const sdk_swagger_options = {
  swaggerOptions: {
    docExpansion: "none",
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
  },
};

module.exports = { swaggerUi, sdk_swagger_spec, sdk_swagger_options };
