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

    // Other configurations can be added here
}; 