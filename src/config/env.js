/**
 * Environment configuration
 * Centralizes all environment variables for easy access throughout the application
 */

// Load environment variables
require('dotenv').config();

module.exports = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_VERSION: process.env.API_VERSION || 'v1',

    // Base path for API routes
    BASE_PATH: `/api/${process.env.API_VERSION || 'v1'}`,

    // Database configuration
    MONGO_URL: process.env.MONGO_URL,
    DB_URI: process.env.DB_URI, // Keeping for backward compatibility

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Swagger configuration
    SWAGGER_API_KEY: process.env.SWAGGER_API_KEY,
    SWAGGER_SUPER_ADMIN_TOKEN: process.env.SWAGGER_SUPER_ADMIN_TOKEN,

    // Other configurations can be added here
}; 