const { deleteCache, clearCacheByPattern } = require("../../config/redis");
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
        const key =
          typeof generateKey === "function" ? generateKey(req) : generateKey;
        if (!key) {
          logger.error("Cache key generation failed", {
            requestUrl: req.originalUrl,
            method: req.method,
          });
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

/**
 * Enhanced Cache Invalidation Middleware with Pattern Support
 * Automatically clears cache when data is modified (POST, PUT, DELETE requests)
 * Supports both exact keys and patterns for query-dependent cache keys
 * @param {...(Function|string|Object)} keyGenerators - Array of functions, strings, or objects that generate cache keys to be invalidated
 * @returns {Function} Express middleware
 */
const enhancedCacheInvalidationMiddleware = (...keyGenerators) => {
  return async (req, res, next) => {
    // Only invalidate cache for modifying requests
    if (!["POST", "PUT", "DELETE"].includes(req.method)) {
      return next();
    }

    // Execute after the route handler completes successfully
    const originalSend = res.json;

    res.json = function (data) {
      // Call original send first
      const result = originalSend.call(this, data);

      // Only invalidate cache if the operation was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        (async () => {
          try {
            for (const keySpec of keyGenerators) {
              if (typeof keySpec === "object" && keySpec.pattern) {
                // Handle pattern-based invalidation
                const pattern =
                  typeof keySpec.pattern === "function"
                    ? keySpec.pattern(req)
                    : keySpec.pattern;
                if (pattern) {
                  logger.debug("Invalidating cache by pattern:", pattern);
                  const deletedCount = await clearCacheByPattern(pattern);
                  logger.debug("Cache invalidated by pattern", {
                    pattern,
                    deletedCount,
                  });
                }
              } else {
                // Handle single key invalidation
                const key =
                  typeof keySpec === "function" ? keySpec(req) : keySpec;
                if (key) {
                  logger.debug("Invalidating cache for key:", key);
                  await deleteCache(key);
                  logger.debug("Cache invalidated", { key });
                }
              }
            }
          } catch (error) {
            logger.error("Cache invalidation error", { error: error.message });
          }
        })();
      }

      return result;
    };

    next();
  };
};

module.exports = {
  cacheInvalidationMiddleware,
  enhancedCacheInvalidationMiddleware,
};
