/**
 * Cache middleware
 * Provides middleware functions for caching API responses
 */

const { getCache, setCache } = require("../config/redis");
const { logger } = require("./logger");

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds
 * @param {Function} keyGenerator - Function to generate cache key (defaults to using URL)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Generate cache key
    const key = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get data from cache
      const cachedData = await getCache(key);

      if (cachedData) {
        logger.debug("Cache hit", { key });
        return res.status(200).json(cachedData);
      }

      // Cache miss, capture the response
      const originalSend = res.json;

      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, data, ttl).catch((err) =>
            logger.error("Error setting cache", { error: err.message, key })
          );
        }

        originalSend.call(this, data);
      };

      logger.debug("Cache miss", { key });
      next();
    } catch (error) {
      logger.error("Cache middleware error", { error: error.message });
      next();
    }
  };
};

/**
 * Cache key generators for common resources
 */
const cacheKeys = {
  // Customer by ID
  customerById: (req) => `cache:customer:${req.params.id}`,

  // All customers with query params
  allCustomers: (req) => {
    const queryString = new URLSearchParams(req.query).toString();
    return `cache:customers:${queryString}`;
  },

  // Transactions by customer ID
  customerTransactions: (req) => `cache:customer:${req.params.id}:transactions`,

  // Tier by ID
  tierById: (req) => `cache:tier:${req.params.id}`,

  // All tiers
  allTiers: () => "cache:tiers",

  // Custom key generator
  custom: (prefix) => (req) => {
    const id = req.params.id || "";
    const queryString = new URLSearchParams(req.query).toString();
    return `cache:${prefix}:${id}:${queryString}`;
  },
};

module.exports = {
  cacheMiddleware,
  cacheKeys,
};
