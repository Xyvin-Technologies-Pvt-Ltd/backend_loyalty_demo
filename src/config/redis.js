/**
 * Redis configuration for Redis Cloud
 * Sets up Redis client for caching and other operations
 */

const Redis = require("ioredis");
const { logger } = require("../middlewares/logger");

// Redis Cloud connection string (provided in your Redis Cloud dashboard)
// Format: redis://username:password@host:port

// Fallback to individual parameters if URL isn't provided
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
const REDIS_USERNAME = process.env.REDIS_USERNAME || "default"; // Redis Cloud may require a username
const REDIS_DB = process.env.REDIS_DB || 0;

// Create Redis client based on available connection info
let redisClient;

if (REDIS_HOST !== "localhost") {
  // Connect using the URL if available
  redisClient = new Redis({
   
    username: REDIS_USERNAME,
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
} else {
  // Connect using individual parameters
  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    tls: REDIS_HOST !== "localhost" ? { rejectUnauthorized: false } : undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

// Redis event handlers
redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis client error", { error: err.message });
  console.log("Redis client error", { error: err.message });
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis client reconnecting");
});

/**
 * Set a value in Redis cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<string>} - Redis response
 */
const setCache = async (key, value, ttl = 3600) => {
  try {
    const serializedValue = JSON.stringify(value);
    if (ttl > 0) {
      return await redisClient.set(key, serializedValue, "EX", ttl);
    }
    return await redisClient.set(key, serializedValue);
  } catch (error) {
    logger.error("Redis setCache error", { error: error.message, key });
    return null;
  }
};

/**
 * Get a value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
const getCache = async (key) => {
  try {
    const cachedData = await redisClient.get(key);
    if (!cachedData) return null;
    return JSON.parse(cachedData);
  } catch (error) {
    logger.error("Redis getCache error", { error: error.message, key });
    return null;
  }
};

/**
 * Delete a value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} - Number of keys removed
 */
const deleteCache = async (key) => {
  try {
    return await redisClient.del(key);
  } catch (error) {
    logger.error("Redis deleteCache error", { error: error.message, key });
    return 0;
  }
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Pattern to match keys (e.g., "user:*")
 * @returns {Promise<number>} - Number of keys removed
 */
const clearCacheByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;
    return await redisClient.del(keys);
  } catch (error) {
    logger.error("Redis clearCacheByPattern error", {
      error: error.message,
      pattern,
    });
    return 0;
  }
};

module.exports = {
  redisClient,
  setCache,
  getCache,
  deleteCache,
  clearCacheByPattern,
};
