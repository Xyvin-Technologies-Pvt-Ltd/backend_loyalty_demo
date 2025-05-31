# Cache Invalidation Fix for Trigger Events

## 🐛 Problem Description

The trigger events API was experiencing a caching issue where:

1. **GET requests showed stale data** even after CREATE, UPDATE, or DELETE operations
2. **Cache was not being properly invalidated** for endpoints with query parameters
3. **Different query parameter combinations** created different cache keys, but only specific keys were being invalidated

## 🔍 Root Cause Analysis

### The Issue

The `allTriggerEvents` cache key generator includes query parameters:

```javascript
allTriggerEvents: (req) => {
  const queryString = new URLSearchParams(req.query).toString();
  return `cache:trigger_events:${queryString}`;
};
```

This creates cache keys like:

- `cache:trigger_events:` (no query params)
- `cache:trigger_events:page=1&limit=10`
- `cache:trigger_events:status=active`
- `cache:trigger_events:search=test&page=1`

### The Problem

The original cache invalidation middleware only cleared specific cache keys, but **couldn't handle all the possible query parameter variations**:

```javascript
// ❌ This only cleared one specific cache key
cacheInvalidationMiddleware(
  cacheKeys.allTriggerEvents, // Only clears the key for current request's query params
  cacheKeys.triggerEventById,
  cacheKeys.triggerServiceByEventId
);
```

## ✅ Solution Implemented

### 1. Enhanced Cache Invalidation Middleware

Created `enhancedCacheInvalidationMiddleware` that supports:

- **Pattern-based cache clearing** using Redis wildcards
- **Post-operation invalidation** (only clears cache after successful operations)
- **Mixed key types** (exact keys and patterns in the same middleware)

```javascript
const enhancedCacheInvalidationMiddleware = (...keyGenerators) => {
  return async (req, res, next) => {
    // Execute after the route handler completes successfully
    const originalSend = res.json;

    res.json = function (data) {
      const result = originalSend.call(this, data);

      // Only invalidate cache if the operation was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        (async () => {
          for (const keySpec of keyGenerators) {
            if (typeof keySpec === "object" && keySpec.pattern) {
              // Handle pattern-based invalidation
              const pattern =
                typeof keySpec.pattern === "function"
                  ? keySpec.pattern(req)
                  : keySpec.pattern;
              if (pattern) {
                const deletedCount = await clearCacheByPattern(pattern);
              }
            } else {
              // Handle single key invalidation
              const key =
                typeof keySpec === "function" ? keySpec(req) : keySpec;
              if (key) {
                await deleteCache(key);
              }
            }
          }
        })();
      }

      return result;
    };

    next();
  };
};
```

### 2. Cache Patterns Helper

Added `cachePatterns` object for consistent pattern usage:

```javascript
const cachePatterns = {
  allCustomers: "cache:customers:*",
  allCouponCategories: "cache:coupon_categories:*",
  allCouponBrands: "cache:coupon_brands:*",
  allPaymentMethods: "cache:payment_methods:*",
  allTriggerEvents: "cache:trigger_events:*",
  allTriggerServices: "cache:trigger_services:*",
  // ... more patterns
};
```

### 3. Updated Route Implementation

```javascript
// ✅ Now clears ALL trigger events cache regardless of query parameters
enhancedCacheInvalidationMiddleware(
  { pattern: cachePatterns.allTriggerEvents }, // Clears cache:trigger_events:*
  cacheKeys.triggerEventById,
  cacheKeys.triggerServiceByEventId
);
```

## 🚀 Benefits of the Fix

### 1. **Complete Cache Invalidation**

- Clears **all cached variations** of trigger events (different query parameters)
- Ensures GET requests always return fresh data after modifications

### 2. **Better Timing**

- Cache invalidation happens **after successful operations** only
- Prevents unnecessary cache clearing on failed operations

### 3. **Maintainable Code**

- Centralized cache patterns
- Reusable enhanced middleware
- Clear documentation and examples

### 4. **Backward Compatibility**

- Original `cacheInvalidationMiddleware` still available
- Can be gradually migrated to enhanced version

## 🧪 Testing the Fix

Run the test script to verify the fix:

```bash
node test_cache_fix.js
```

The test demonstrates:

1. Setting multiple cache entries with different query parameters
2. Clearing all entries using pattern matching
3. Verifying complete cache invalidation

## 🔧 Usage Examples

### For Query-Dependent Endpoints

```javascript
// Use enhanced middleware with patterns
enhancedCacheInvalidationMiddleware(
  { pattern: cachePatterns.allTriggerEvents },
  cacheKeys.triggerEventById
);
```

### For Simple Endpoints

```javascript
// Use original middleware for exact keys
cacheInvalidationMiddleware(cacheKeys.allTiers, cacheKeys.tierById);
```

### Custom Patterns

```javascript
// Use custom patterns
enhancedCacheInvalidationMiddleware(
  { pattern: "cache:custom_resource:*" },
  { pattern: (req) => `cache:user:${req.user.id}:*` }
);
```

## 📝 Migration Guide

To apply this fix to other modules with similar issues:

1. **Identify query-dependent cache keys** in your routes
2. **Replace** `cacheInvalidationMiddleware` with `enhancedCacheInvalidationMiddleware`
3. **Use pattern objects** `{ pattern: "cache:resource:*" }` instead of direct key functions
4. **Test thoroughly** to ensure proper cache invalidation

## 🔍 Related Files Modified

- `src/middlewares/redis_cache/cache_invalidation.middleware.js` - Enhanced middleware
- `src/middlewares/redis_cache/cache.middleware.js` - Added cache patterns
- `src/modules/trigger_event/trigger_event.routes.js` - Updated routes
- `test_cache_fix.js` - Test script

## 🚨 Important Notes

1. **Redis Connection Required** - Ensure Redis is running and properly configured
2. **Performance Consideration** - Pattern-based clearing might be slower than exact key clearing
3. **Memory Usage** - Monitor Redis memory usage as patterns might match many keys
4. **Testing** - Always test cache invalidation in staging before production deployment

## 🎯 Next Steps

Consider applying this pattern to other modules that might have similar caching issues:

- Coupon categories (`cache:coupon_categories:*`)
- Coupon brands (`cache:coupon_brands:*`)
- Payment methods (`cache:payment_methods:*`)
- Trigger services (`cache:trigger_services:*`)
- Any other endpoint that uses query parameters for caching
