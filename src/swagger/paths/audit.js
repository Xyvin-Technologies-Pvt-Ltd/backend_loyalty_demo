/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit logging and monitoring
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The log ID
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the event occurred
 *         category:
 *           type: string
 *           enum: [authentication, data_access, admin_action, data_modification, system_event, error, api, point_transaction]
 *           description: The category of the log
 *         action:
 *           type: string
 *           description: The specific action that was performed
 *         status:
 *           type: string
 *           enum: [success, failure, warning, info]
 *           description: The status of the action
 *         user:
 *           type: string
 *           description: The ID of the user who performed the action
 *         userModel:
 *           type: string
 *           enum: [User, Admin]
 *           description: The type of user
 *         userName:
 *           type: string
 *           description: The name of the user
 *         userEmail:
 *           type: string
 *           description: The email of the user
 *         ip:
 *           type: string
 *           description: The IP address of the user
 *         userAgent:
 *           type: string
 *           description: The user agent of the user
 *         requestId:
 *           type: string
 *           description: A unique ID for the request for correlation
 *         targetId:
 *           type: string
 *           description: The ID of the target object
 *         targetModel:
 *           type: string
 *           description: The type of the target object
 *         targetName:
 *           type: string
 *           description: The name of the target object
 *         description:
 *           type: string
 *           description: A description of the action
 *         details:
 *           type: object
 *           description: Additional details about the action
 *         before:
 *           type: object
 *           description: The state of the object before the action
 *         after:
 *           type: object
 *           description: The state of the object after the action
 *         endpoint:
 *           type: string
 *           description: The API endpoint that was accessed
 *         method:
 *           type: string
 *           description: The HTTP method that was used
 *         responseTime:
 *           type: number
 *           description: The time taken to respond in milliseconds
 *         responseStatus:
 *           type: number
 *           description: The HTTP status code of the response
 *         points:
 *           type: number
 *           description: The number of points involved in a transaction
 *         transactionType:
 *           type: string
 *           enum: [earning, redemption, expiry, adjustment, referral]
 *           description: The type of point transaction
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the log was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the log was last updated
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         timestamp: "2023-06-18T14:30:00.000Z"
 *         category: "admin_action"
 *         action: "update_user"
 *         status: "success"
 *         user: "60d21b4667d0d8992e610c86"
 *         userModel: "Admin"
 *         userName: "Admin User"
 *         userEmail: "admin@example.com"
 *         ip: "192.168.1.1"
 *         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *         requestId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         targetId: "60d21b4667d0d8992e610c87"
 *         targetModel: "User"
 *         targetName: "John Doe"
 *         description: "Updated user profile"
 *         details: { fields: ["name", "email"] }
 *         before: { name: "John", email: "john@example.com" }
 *         after: { name: "John Doe", email: "johndoe@example.com" }
 *         createdAt: "2023-06-18T14:30:00.000Z"
 *         updatedAt: "2023-06-18T14:30:00.000Z"
 *
 *     AuditStatistics:
 *       type: object
 *       properties:
 *         totalLogs:
 *           type: number
 *           description: Total number of logs
 *         categoryStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Category name
 *               count:
 *                 type: number
 *                 description: Number of logs in this category
 *         statusStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Status name
 *               count:
 *                 type: number
 *                 description: Number of logs with this status
 *         actionStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Action name
 *               count:
 *                 type: number
 *                 description: Number of logs with this action
 *         activityTrend:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Date in YYYY-MM-DD format
 *               count:
 *                 type: number
 *                 description: Number of logs on this date
 */

/**
 * @swagger
 * /audit/logs:
 *   get:
 *     summary: Get audit logs with filtering and pagination
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in description, userName, userEmail, targetName
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: timestamp
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         pages:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /audit/logs/{id}:
 *   get:
 *     summary: Get audit log by ID
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit log ID
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Audit log not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /audit/point-transactions:
 *   get:
 *     summary: Get point transaction logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [earning, redemption, expiry, adjustment, referral]
 *         description: Filter by transaction type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Point transaction logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         pages:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /audit/admin-actions:
 *   get:
 *     summary: Get admin action logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filter by admin ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Admin action logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         pages:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /audit/reports/statistics:
 *   get:
 *     summary: Get audit statistics
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Audit statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AuditStatistics'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */

module.exports = {
    // This file is automatically loaded by the Swagger configuration
}; 