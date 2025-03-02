# Enhanced Audit Module

This document describes the enhancements made to the Audit Module to improve its functionality, performance, and ease of integration.

## New Features

### 1. Universal Audit Middleware

A flexible middleware that can be used to audit any route with minimal configuration. This middleware automatically detects the user type, extracts relevant information, and logs the appropriate audit event.

```javascript
const { universalAudit } = require("../modules/audit");

router.post(
  "/users",
  universalAudit({
    category: "data_modification",
    action: "create_user",
    description: "Create a new user",
    targetModel: "User",
  }),
  userController.createUser
);
```

### 2. Module-Specific Audit Middleware Factory

A utility to create audit middleware specific to a module, making it easier to integrate audit logging into other modules.

```javascript
const { createAuditMiddleware } = require("../modules/audit");

// Create audit middleware for the user module
const userAudit = createAuditMiddleware("user");

router.post(
  "/users",
  userAudit.dataModification("create_user", {
    description: "Create a new user",
  }),
  userController.createUser
);
```

### 3. Response Capture Middleware

A middleware to capture response bodies for audit logging, making it easier to log the results of operations.

```javascript
const { captureResponse } = require("../modules/audit");

router.post(
  "/users",
  captureResponse(),
  userAudit.dataModification("create_user", {
    description: "Create a new user",
    getModifiedData: (req, res) => res.locals.responseBody?.data,
  }),
  userController.createUser
);
```

### 4. Background Processing for High-Volume Operations

The audit service now supports background processing for high-volume operations, improving performance by not blocking the main thread.

### 5. Centralized Audit Configuration

A centralized configuration file for audit settings, making it easier to manage audit logging across the application.

```javascript
// src/config/audit.js
const auditConfig = {
  enabled: true,
  ttl: 90 * 24 * 60 * 60, // 90 days in seconds
  useBackgroundProcessing: NODE_ENV === "production",
  // ...
};
```

## Integration Examples

### Basic Integration

```javascript
const { universalAudit } = require("../modules/audit");

router.post(
  "/users",
  universalAudit({
    category: "data_modification",
    action: "create_user",
    description: "Create a new user",
    targetModel: "User",
  }),
  userController.createUser
);
```

### Module-Specific Integration

```javascript
const { createAuditMiddleware } = require("../modules/audit");

// Create audit middleware for the user module
const userAudit = createAuditMiddleware("user");

// Data access
router.get(
  "/users",
  userAudit.dataAccess("list_users", {
    description: "List all users",
  }),
  userController.listUsers
);

// Data modification with before/after data
router.put(
  "/users/:id",
  userAudit.dataModification("update_user", {
    targetId: (req) => req.params.id,
    description: "Update a user",
    getOriginalData: async (req) => {
      const User = require("../models/user_model");
      const user = await User.findById(req.params.id);
      return user ? user.toObject() : null;
    },
  }),
  userController.updateUser
);

// Admin action
router.delete(
  "/users/:id",
  userAudit.adminAction("delete_user", {
    targetId: (req) => req.params.id,
    description: "Delete a user",
  }),
  userController.deleteUser
);

// Authentication
router.post(
  "/login",
  userAudit.authentication("login", {
    description: "User login",
  }),
  authController.login
);

// Point transaction
router.post(
  "/points/award",
  userAudit.pointTransaction("award_points", {
    targetId: (req) => req.body.userId,
    description: "Award points to a user",
  }),
  pointsController.awardPoints
);
```

### Capturing Response Data

```javascript
router.post(
  "/users",
  captureResponse(),
  userAudit.dataModification("create_user", {
    description: "Create a new user",
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    },
  }),
  userController.createUser
);
```

## Best Practices

1. **Use Module-Specific Middleware**: Use `createAuditMiddleware` to create middleware specific to each module.

2. **Capture Before/After Data**: For data modifications, always capture the state before and after the change.

3. **Use Response Capture**: Use `captureResponse` middleware to capture response data for audit logs.

4. **Be Consistent with Action Names**: Use consistent action names across the application, prefixed with the module name.

5. **Include Context**: Always include relevant context in the logs (who, what, when, where, why).

6. **Sanitize Sensitive Data**: Use the built-in sanitization to avoid logging sensitive data.

7. **Configure for Performance**: In production, enable background processing for high-volume operations.

## Configuration Options

### Universal Audit Middleware Options

| Option            | Type               | Description                                                   |
| ----------------- | ------------------ | ------------------------------------------------------------- |
| `category`        | String             | The audit category (e.g., 'data_access', 'data_modification') |
| `action`          | String             | The action being performed                                    |
| `description`     | String or Function | Description of the action                                     |
| `targetModel`     | String             | The model being affected                                      |
| `targetId`        | String or Function | ID of the target entity                                       |
| `targetName`      | String or Function | Name of the target entity                                     |
| `getOriginalData` | Async Function     | Function to retrieve the original data                        |
| `getModifiedData` | Async Function     | Function to retrieve the modified data                        |
| `details`         | Object or Function | Additional details about the action                           |
| `logRequestBody`  | Boolean            | Whether to log the request body                               |
| `logResponseBody` | Boolean            | Whether to log the response body                              |

### Response Capture Middleware Options

| Option                | Type    | Description                                    |
| --------------------- | ------- | ---------------------------------------------- |
| `maxSize`             | Number  | Maximum size of response to capture (in bytes) |
| `captureBinary`       | Boolean | Whether to capture binary responses            |
| `excludeContentTypes` | Array   | Content types to exclude from capture          |

## Audit Categories

| Category            | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `authentication`    | Authentication events (login, logout, password changes) |
| `data_access`       | Data viewed or accessed                                 |
| `admin_action`      | Actions performed by administrators                     |
| `data_modification` | Data created, updated, deleted                          |
| `system_event`      | System-level events                                     |
| `error`             | Errors and exceptions                                   |
| `api`               | API calls                                               |
| `point_transaction` | Point earning, redemption, expiry                       |
