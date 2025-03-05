# Recommendations for Codebase Improvements

## 1. Folder Structure Standardization

### Current Structure

Your project has a good foundation with a modular approach, but there are inconsistencies in how modules are organized:

- Some modules use a flat structure (e.g., `tier`, `role`, `point_criteria`)
- Others use nested directories (e.g., `sdk`, `theme_settings`)

### Recommended Structure

Standardize all modules to follow this pattern:

```
src/
├── modules/
│   ├── module-name/
│   │   ├── index.js                 # Exports all module components
│   │   ├── controllers/             # Business logic
│   │   │   └── module.controller.js
│   │   ├── routes/                  # Route definitions
│   │   │   └── module.routes.js
│   │   ├── validators/              # Request validation
│   │   │   └── module.validator.js
│   │   ├── services/                # Business logic separated from controllers
│   │   │   └── module.service.js
│   │   ├── models/                  # Module-specific models (if applicable)
│   │   │   └── module.model.js
│   │   └── tests/                   # Module tests
│   │       └── module.test.js
```

## 2. Code Organization Improvements

### Implement Service Layer

Currently, your controllers handle both request processing and business logic. Separate these concerns:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Data access and schema definitions

Example service implementation:

```javascript
// src/modules/transaction/services/transaction.service.js
const Transaction = require("../../../models/transaction_model");

class TransactionService {
  async getAllTransactions(filters = {}) {
    return Transaction.find(filters).sort({ createdAt: -1 });
  }

  async getTransactionById(id) {
    return Transaction.findById(id);
  }

  // More business logic methods
}

module.exports = new TransactionService();
```

Example controller using service:

```javascript
// src/modules/transaction/controllers/transaction.controller.js
const transactionService = require("../services/transaction.service");

exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.query);
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
```

## 3. Error Handling Improvements

### Centralized Error Classes

Create custom error classes for different types of errors:

```javascript
// src/utils/errors/api-error.js
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends ApiError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

// Export all error classes
module.exports = {
  ApiError,
  BadRequestError,
  NotFoundError,
  // Add more as needed
};
```

## 4. Middleware Improvements

### Request Validation Middleware

Create a generic validation middleware:

```javascript
// src/middlewares/validate.js
const Joi = require("joi");
const { BadRequestError } = require("../utils/errors/api-error");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return next(new BadRequestError(errorMessage));
  }

  next();
};

module.exports = validate;
```

## 5. Testing Infrastructure

Add Jest for unit and integration testing:

```javascript
// Example test for transaction service
// src/modules/transaction/tests/transaction.service.test.js
const transactionService = require("../services/transaction.service");
const Transaction = require("../../../models/transaction_model");

// Mock the Transaction model
jest.mock("../../../models/transaction_model");

describe("Transaction Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAllTransactions returns transactions sorted by createdAt", async () => {
    // Setup
    const mockTransactions = [{ id: "1" }, { id: "2" }];
    Transaction.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockTransactions),
    });

    // Execute
    const result = await transactionService.getAllTransactions();

    // Assert
    expect(Transaction.find).toHaveBeenCalled();
    expect(result).toEqual(mockTransactions);
  });
});
```

## 6. Documentation Improvements

### API Documentation

Improve your Swagger documentation:

```javascript
// src/swagger/components/schemas/Transaction.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - user
 *         - amount
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the transaction
 *         user:
 *           type: string
 *           description: User ID associated with this transaction
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         type:
 *           type: string
 *           enum: [EARN, REDEEM, EXPIRE, ADJUST]
 *           description: Type of transaction
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *           default: COMPLETED
 *           description: Status of the transaction
 *         metadata:
 *           type: object
 *           description: Additional transaction data
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the transaction was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the transaction was last updated
 */
```

## 7. Configuration Management

### Environment Variables

Enhance your environment variable handling:

```javascript
// src/config/env.js
const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Define validation schema for environment variables
const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("development", "production", "test")
      .required(),
    PORT: Joi.number().default(3000),
    MONGO_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default("7d"),
    // Add other environment variables here
  })
  .unknown();

// Validate environment variables
const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGO_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  // Add other configuration sections
};
```

## 8. Security Enhancements

### Security Middleware

Add security middleware:

```javascript
// src/config/express.js
const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const { env } = require("./env");

module.exports = () => {
  const app = express();

  // Set security HTTP headers
  app.use(helmet());

  // Parse JSON request body
  app.use(express.json());

  // Parse URL-encoded request body
  app.use(express.urlencoded({ extended: true }));

  // Sanitize request data against XSS
  app.use(xss());

  // Sanitize request data against NoSQL query injection
  app.use(mongoSanitize());

  // Compress response bodies
  app.use(compression());

  // Enable CORS
  app.use(cors());

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
};
```

## 9. Logging Improvements

### Structured Logging

Enhance your logging with structured logs:

```javascript
// src/middlewares/logger.js
const winston = require("winston");
const { env } = require("../config/env");

const logger = winston.createLogger({
  level: env === "development" ? "debug" : "info",
  format: winston.format.combine(
    env === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
      }`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// Create a middleware to log HTTP requests
const requestLogger = (req, res, next) => {
  const startTime = new Date();

  res.on("finish", () => {
    const duration = new Date() - startTime;
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};

module.exports = { logger, requestLogger };
```

## 10. Performance Optimization

### Implement Caching

Add Redis caching for frequently accessed data:

```javascript
// src/utils/cache.js
const redis = require("redis");
const { promisify } = require("util");
const { logger } = require("../middlewares/logger");

// Create Redis client
const client = redis.createClient(process.env.REDIS_URL);

client.on("error", (error) => {
  logger.error("Redis error:", error);
});

client.on("connect", () => {
  logger.info("Redis connected successfully");
});

// Promisify Redis commands
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached data or null
 */
const getCache = async (key) => {
  try {
    const data = await getAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error("Redis get error:", error);
    return null;
  }
};

/**
 * Set cache data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expiry - Expiry time in seconds
 * @returns {Promise<boolean>} - Success status
 */
const setCache = async (key, data, expiry = 3600) => {
  try {
    await setAsync(key, JSON.stringify(data), "EX", expiry);
    return true;
  } catch (error) {
    logger.error("Redis set error:", error);
    return false;
  }
};

/**
 * Delete cache data
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
const deleteCache = async (key) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    logger.error("Redis delete error:", error);
    return false;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
};
```
