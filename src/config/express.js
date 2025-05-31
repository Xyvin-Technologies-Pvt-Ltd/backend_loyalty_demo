/**
 * Express configuration
 * Sets up the Express application with middleware and basic settings
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { request_logger, error_logger } = require("../middlewares/logger");
const { auditMiddleware } = require("../modules/audit");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const compression = require("compression");
const { env } = require("./env");
const {
  metricsMiddleware,
  metricsEndpoint,
} = require("../middlewares/metrics.middleware");

// Get the appropriate upload path based on environment
function getUploadPath() {
  // Check if running in Docker container
  const isDocker =
    fs.existsSync("/.dockerenv") || process.env.NODE_ENV !== "development";

  if (isDocker) {
    // Docker container path (will be mounted as volume in production)
    return "/app/uploads";
  } else {
    // Local development path (relative to project root)
    return path.join(process.cwd(), "uploads");
  }
}

/**
 * Initialize Express application with common middleware
 * @returns {Object} Configured Express application
 */
function initializeExpress() {
  // Create Express application
  const app = express();
  // Set security HTTP headers
  app.use(helmet());

  // Compress response bodies
  app.use(compression());

  // Enable Cross-Origin Resource Sharing (CORS)
  app.use(cors());

  // Parse JSON request bodies
  app.use(express.json());

  // Parse URL-encoded request body
  app.use(express.urlencoded({ extended: true }));

  // Sanitize request data against XSS
  app.use(xss());

  // Serve static files from uploads directory
  // This allows uploaded files to be accessed via /uploads/filename
  const uploadPath = getUploadPath();

  // Ensure upload directory exists for static serving
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(
      `📁 Created upload directory for static serving: ${uploadPath}`
    );
  }

  app.use(
    "/uploads",
    express.static(uploadPath, {
      maxAge: "1d", // Cache files for 1 day
      etag: true,
      lastModified: true,
    })
  );

  console.log(`📂 Static files served from: ${uploadPath} → /uploads/*`);

  // Apply metrics middleware
  app.use(metricsMiddleware);

  // Expose metrics endpoint
  app.get("/metrics", metricsEndpoint);

  // Apply request logging middleware
  app.use(request_logger);

  // Apply audit API request logging middleware to all routes
  app.use(auditMiddleware.auditApiRequest());

  // Apply error logging middleware (should be applied after routes)
  app.use(error_logger);

  // Add rate limiting
  if (env === "production") {
    const rateLimit = require("express-rate-limit");
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: "Too many requests from this IP, please try again later",
      })
    );
  }

  return app;
}

module.exports = initializeExpress;
