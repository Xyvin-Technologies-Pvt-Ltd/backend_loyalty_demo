const swaggerJSDoc = require("swagger-jsdoc");
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
      url: `https://api-loyalty.xyvin.com/api/${API_VERSION}`,
      description: "Staging Server",
    },
    // {
    //   url: `https://staging-api.loyaltyapp.com/${API_VERSION}`,
    //   description: "Staging Server",
    // },
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
  apis: [
    "./src/swagger/paths/*.yaml",  // Include all YAML files
    "./src/swagger/paths/*.js"     // Include all JS files
  ],};

const swagger_options = {
  swaggerOptions: {
    docExpansion: "none",
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
    requestInterceptor: (req) => {
      req.headers["api-key"] = `H0RIRxapB4Uo7im`; // Set your default API key here
      req.headers["Authorization"] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjY3Y2M1NmUyZjcxZjMyZDU1MDA2ZWZkZSIsIm5hbWUiOiJUaWpvIEpvc2VwaCIsImVtYWlsIjoidHRqQGR1Y2suY29tIiwicm9sZSI6IlN1cGVyIEFkbWluIiwicGVybWlzc2lvbnMiOlsiVklFV19DVVNUT01FUlMiLCJFRElUX0NVU1RPTUVSUyIsIkRFTEVURV9DVVNUT01FUlMiLCJFWFBPUlRfQ1VTVE9NRVJTIiwiTUFOQUdFX1BPSU5UUyIsIlZJRVdfUE9JTlRTX0hJU1RPUlkiLCJBREpVU1RfUE9JTlRTIiwiTUFOQUdFX0NSSVRFUklBIiwiQ1JFQVRFX09GRkVSUyIsIkVESVRfT0ZGRVJTIiwiREVMRVRFX09GRkVSUyIsIk1BTkFHRV9SRURFTVBUSU9OUyIsIk1BTkFHRV9USUVSUyIsIlZJRVdfVElFUlMiLCJBU1NJR05fVElFUlMiLCJWSUVXX1JFUE9SVFMiLCJFWFBPUlRfUkVQT1JUUyIsIk1BTkFHRV9BTkFMWVRJQ1MiLCJWSUVXX0RBU0hCT0FSRCIsIk1BTkFHRV9ST0xFUyIsIk1BTkFHRV9BRE1JTlMiLCJWSUVXX0FVRElUX0xPR1MiLCJNQU5BR0VfU0VUVElOR1MiLCJ2aWV3X2FwcF90eXBlcyJdLCJzdGF0dXMiOnRydWUsImlhdCI6MTc0MTUzNjA2OSwiZXhwIjoxNzQ0MTI4MDY5fQ.EK6zy_kG4buuSI19KmNlrZjm2ab8Pbd5gzxPFFDJog8`;
      return req;
    },
  },
};

const swagger_spec = swaggerJSDoc(options);

module.exports = { swagger_spec, swagger_options };
