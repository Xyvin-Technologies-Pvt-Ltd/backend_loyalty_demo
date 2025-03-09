/**
 * Metrics middleware
 * Provides Prometheus metrics for application monitoring
 */

const promClient = require("prom-client");
const { logger } = require("./logger");

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (memory, CPU, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP request counter
const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// HTTP request duration histogram
const httpRequestDurationMs = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
  registers: [register],
});

// Database operation counter
const dbOperationsTotal = new promClient.Counter({
  name: "db_operations_total",
  help: "Total number of database operations",
  labelNames: ["operation", "model"],
  registers: [register],
});

// Database operation duration histogram
const dbOperationDurationMs = new promClient.Histogram({
  name: "db_operation_duration_ms",
  help: "Database operation duration in milliseconds",
  labelNames: ["operation", "model"],
  buckets: [1, 5, 10, 50, 100, 500, 1000],
  registers: [register],
});

// Cache hit/miss counter
const cacheOperationsTotal = new promClient.Counter({
  name: "cache_operations_total",
  help: "Total number of cache operations",
  labelNames: ["operation", "result"],
  registers: [register],
});

// Job processing counter
const jobsProcessedTotal = new promClient.Counter({
  name: "jobs_processed_total",
  help: "Total number of background jobs processed",
  labelNames: ["queue", "status"],
  registers: [register],
});

// Job processing duration histogram
const jobProcessingDurationMs = new promClient.Histogram({
  name: "job_processing_duration_ms",
  help: "Background job processing duration in milliseconds",
  labelNames: ["queue"],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000, 30000, 60000],
  registers: [register],
});

// API error counter
const apiErrorsTotal = new promClient.Counter({
  name: "api_errors_total",
  help: "Total number of API errors",
  labelNames: ["route", "error_code"],
  registers: [register],
});

/**
 * Middleware to track HTTP request metrics
 */
const metricsMiddleware = (req, res, next) => {
  // Record start time
  const start = Date.now();

  // Record original end method
  const originalEnd = res.end;

  // Override end method to capture metrics
  res.end = function () {
    // Calculate request duration
    const duration = Date.now() - start;

    // Get route (normalize dynamic routes)
    const route = req.route
      ? req.baseUrl + req.route.path.replace(/:[^/]+/g, ":param")
      : req.path;

    // Increment request counter
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });

    // Record request duration
    httpRequestDurationMs.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      duration
    );

    // If error, increment error counter
    if (res.statusCode >= 400) {
      apiErrorsTotal.inc({
        route,
        error_code: res.statusCode,
      });
    }

    // Call original end method
    return originalEnd.apply(this, arguments);
  };

  next();
};

/**
 * Metrics endpoint handler
 */
const metricsEndpoint = async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error("Error generating metrics", { error: error.message });
    res.status(500).end();
  }
};

/**
 * Track database operation
 * @param {string} operation - Operation type (find, create, update, delete)
 * @param {string} model - Model name
 * @param {Function} callback - Function to execute and measure
 * @returns {Promise<any>} - Result of the callback
 */
const trackDbOperation = async (operation, model, callback) => {
  const start = Date.now();

  try {
    const result = await callback();

    // Record metrics
    dbOperationsTotal.inc({ operation, model });
    dbOperationDurationMs.observe({ operation, model }, Date.now() - start);

    return result;
  } catch (error) {
    // Still record the operation even if it failed
    dbOperationsTotal.inc({ operation, model });
    dbOperationDurationMs.observe({ operation, model }, Date.now() - start);

    throw error;
  }
};

/**
 * Track cache operation
 * @param {string} operation - Operation type (get, set, delete)
 * @param {string} result - Result (hit, miss, success, error)
 */
const trackCacheOperation = (operation, result) => {
  cacheOperationsTotal.inc({ operation, result });
};

/**
 * Track job processing
 * @param {string} queue - Queue name
 * @param {string} status - Job status (completed, failed)
 * @param {number} duration - Processing duration in milliseconds
 */
const trackJobProcessing = (queue, status, duration) => {
  jobsProcessedTotal.inc({ queue, status });

  if (duration) {
    jobProcessingDurationMs.observe({ queue }, duration);
  }
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  trackDbOperation,
  trackCacheOperation,
  trackJobProcessing,
  register,
};
