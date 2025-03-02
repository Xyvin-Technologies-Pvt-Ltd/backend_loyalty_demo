# Audit Module

The Audit Module provides comprehensive logging capabilities for tracking user actions, admin operations, SDK client activities, security events, and system errors across the loyalty platform.

## Overview

This module enables detailed audit trails for all significant actions in the system, helping with:

- **Security Monitoring**: Track authentication attempts, permission changes, and suspicious activities
- **Compliance**: Maintain records of all data modifications for regulatory requirements
- **Troubleshooting**: Log errors with context for easier debugging
- **User Activity Tracking**: Monitor how users interact with the system
- **Admin Accountability**: Record all administrative actions
- **SDK/API Usage**: Track how external clients use your API

## Core Components

### Services

- **AuditService**: Central service that provides methods for logging different types of events:
  - `logUserAction`: Records actions performed by regular users
  - `logAdminAction`: Records actions performed by administrators
  - `logSDKAction`: Records actions performed by SDK/API clients
  - `logSecurityEvent`: Records security-related events (login attempts, password changes, etc.)
  - `logSystemEvent`: Records system-level events (startup, shutdown, etc.)
  - `logError`: Records errors that occur in the system

### Models

- **AuditLog**: Stores all audit records with appropriate indexing for efficient querying
- **AuditLogType**: Enum defining the different types of audit logs (USER, ADMIN, SDK, SECURITY, SYSTEM, ERROR)

### Middleware

- **auditUserAction**: Middleware for logging user actions
- **auditAdminAction**: Middleware for logging admin actions
- **auditSDKAction**: Middleware for logging SDK/API client actions
- **auditDataModification**: Generic middleware for logging data changes
- **auditSecurityEvent**: Middleware for logging security events

## Installation

The Audit Module is pre-installed as part of the loyalty platform. No additional installation steps are required.

## Usage

### Direct Service Usage

For direct logging in controller functions:

```javascript
const { AuditService } = require("../modules/audit");

// In a controller function
try {
  // Perform some action
  const updatedUser = await User.findByIdAndUpdate(userId, updateData);

  // Log the action
  await AuditService.logAdminAction({
    action: "update_user",
    user: req.admin._id,
    userModel: "Admin",
    userName: req.admin.name,
    targetId: userId,
    targetModel: "User",
    description: "Admin updated user profile",
    before: originalUserData,
    after: updatedUser,
  });

  // Return response
  return res.status(200).json({ success: true, data: updatedUser });
} catch (error) {
  // Log the error
  await AuditService.logError({
    action: "update_user",
    user: req.admin._id,
    description: "Error updating user",
    errorMessage: error.message,
    stackTrace: error.stack,
  });

  // Return error response
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
}
```

### Middleware Usage

For route-level logging using middleware:

```javascript
const {
  auditAdminAction,
} = require("../modules/audit/middlewares/audit.middleware");

// In a routes file
router.put(
  "/users/:id",
  protect,
  authorize("MANAGE_USERS"),
  auditAdminAction("update_user", {
    targetModel: "User",
    targetId: (req) => req.params.id,
    description: "Admin updated user profile",
    getOriginalData: async (req) => {
      const user = await User.findById(req.params.id);
      return user
        ? {
            name: user.name,
            email: user.email,
            points: user.points,
          }
        : null;
    },
  }),
  updateUserController
);
```

## Integration Examples

The module includes several example integrations to demonstrate how to use audit logging in different contexts:

- **Admin Integration**: Examples for logging admin actions like user management and system settings changes
- **User Integration**: Examples for logging user actions like profile updates and password changes
- **Transaction Integration**: Examples for logging transaction-related actions like creating transactions and redeeming points
- **SDK Integration**: Examples for logging SDK client actions like issuing points and retrieving user information

See the `examples` directory for detailed implementation examples.

## Middleware Options

### Common Options for All Middleware

| Option            | Type               | Description                                                |
| ----------------- | ------------------ | ---------------------------------------------------------- |
| `action`          | String             | The action being performed (e.g., 'update_user', 'login')  |
| `description`     | String or Function | Description of the action being performed                  |
| `targetModel`     | String             | The model being affected (e.g., 'User', 'Transaction')     |
| `targetId`        | String or Function | ID of the target entity                                    |
| `targetName`      | String or Function | Name or identifier of the target entity                    |
| `getOriginalData` | Async Function     | Function to retrieve the original data before modification |
| `getModifiedData` | Async Function     | Function to retrieve the data after modification           |
| `details`         | Object or Function | Additional details about the action                        |

### Specific Options

#### auditSecurityEvent

- `securityEvent`: Boolean - Whether this is a security event (default: true)
- `status`: String or Function - Status of the security event (success/failure)

#### auditSDKAction

- `clientField`: String - Field in the request containing the client info (default: 'client')

## Query API

The Audit Module provides a query API for retrieving audit logs:

```javascript
// Get all admin actions
const adminLogs = await AuditLog.find({ type: "ADMIN" })
  .sort({ createdAt: -1 })
  .limit(100);

// Get all actions for a specific user
const userLogs = await AuditLog.find({
  type: "USER",
  "metadata.user": userId,
}).sort({ createdAt: -1 });

// Get all security events
const securityLogs = await AuditLog.find({ type: "SECURITY" }).sort({
  createdAt: -1,
});

// Get all errors
const errorLogs = await AuditLog.find({ type: "ERROR" }).sort({
  createdAt: -1,
});
```

## Best Practices

1. **Be Consistent**: Use consistent action names across the application
2. **Include Context**: Always include relevant context in the logs (who, what, when, where, why)
3. **Before/After Data**: For data modifications, include the state before and after the change
4. **Error Handling**: Always log errors with stack traces and context
5. **Sensitive Data**: Avoid logging sensitive data (passwords, tokens, etc.)
6. **Performance**: For high-volume operations, consider using background processing for logging

## Extending the Module

To add new audit log types or functionality:

1. Update the `AuditLogType` enum in the model
2. Add new methods to the `AuditService` class
3. Create new middleware functions if needed
4. Update the query API to support the new log types

## Troubleshooting

Common issues:

- **Missing Logs**: Ensure error handling is properly implemented in controllers
- **Performance Issues**: Consider indexing frequently queried fields in the AuditLog model
- **Large Log Volume**: Implement log rotation or archiving for older logs

## License

This module is part of the loyalty platform and is subject to the same license terms.

## Support

For issues or feature requests, please contact the development team.
