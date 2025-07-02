const response_handler = require("../../helpers/response_handler");

const key_protect = async (req, res, next) => {
  try {
    //? Check for API key in both possible header formats
    const apiKey = req.headers["api-key"] || req.headers["x-api-key"];

    // Use development API key if no environment variable is set
    const expectedApiKey = process.env.API_KEY || "dev-api-key-2024";

    console.log("API Key Debug:", {
      "api-key": req.headers["api-key"] ? "present" : "undefined",
      "x-api-key": req.headers["x-api-key"] ? "present" : "undefined",
      finalApiKey: apiKey ? "present" : "undefined",
      expectedApiKey: expectedApiKey ? "present" : "undefined",
      environment: process.env.NODE_ENV || "development",
      usingFallback: !process.env.API_KEY,
    });

    if (!apiKey) {
      return response_handler(
        res,
        401,
        "No API key provided. Use header 'api-key' or 'x-api-key'."
      );
    }

    if (apiKey !== expectedApiKey) {
      return response_handler(
        res,
        401,
        `Invalid API key. Expected: ${expectedApiKey.substring(0, 8)}...`
      );
    }

    // Log successful authentication
    console.log("✅ API Key validated successfully");
    next();
  } catch (error) {
    return response_handler(
      res,
      500,
      `Failed to match API key. ${error.message}`
    );
  }
};

module.exports = key_protect;
