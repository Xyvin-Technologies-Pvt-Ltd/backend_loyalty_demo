const { deleteCache } = require("../../config/redis");
const { logger } = require("../logger");

/**
 * Cache Invalidation Middleware
 * Automatically clears cache when data is modified (POST, PUT, DELETE requests)
 * @param {Function[]} keyGenerators - Array of functions that generate cache keys to be invalidated
 * @returns {Function} Express middleware
 */
const cacheInvalidationMiddleware = (...keyGenerators) => {
  return async (req, res, next) => {
    // Only invalidate cache for modifying requests
    if (!["POST", "PUT", "DELETE"].includes(req.method)) {
      return next();
    }

    try {
      for (const generateKey of keyGenerators) {
        const key = typeof generateKey === "function" ? generateKey(req) : generateKey;
        if (!key) {
          logger.error("Cache key generation failed", { requestUrl: req.originalUrl,method: req.method });
          continue; // Skip invalid keys
        }

        logger.debug("Invalidating cache for key:", key);
        await deleteCache(key);
        logger.debug("Cache invalidated", { key });
      }
    } catch (error) {
      logger.error("Cache invalidation error", { error: error.message });
    }

    next();
  };
};

module.exports = { cacheInvalidationMiddleware };
