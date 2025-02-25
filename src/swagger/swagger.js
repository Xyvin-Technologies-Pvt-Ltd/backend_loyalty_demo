const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { PORT, API_VERSION } = process.env;

const swagger_definition = {
  openapi: "3.0.0",
  info: {
    title: "Loyalty Backend API Documentation",
    version: "1.0.0",
    description:
      "Comprehensive API documentation for the Loyalty Management System",
    contact: {
      name: "Support Team",
      email: "support@xyvin.com",
      url: "https://xyvin.com",
    },
  },
  servers: [
    {
      url: `https://api.loyaltyapp.com/${API_VERSION}`,
      description: "Production Server",
    },
    {
      url: `https://staging-api.loyaltyapp.com/${API_VERSION}`,
      description: "Staging Server",
    },
    {
      url: `http://localhost:${PORT}/api/${API_VERSION}`,
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "api-key",
        description: "API Key required for authentication",
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
    {
      ApiKeyAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition: swagger_definition,
  apis: ["./src/swagger/paths/*.js"],
};

const swagger_options = {
  swaggerOptions: {
    docExpansion: "none",
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
  },
};

const swagger_spec = swaggerJSDoc(options);

module.exports = { swaggerUi, swagger_spec, swagger_options };
