/**
 * @swagger
 * tags:
 *   name: Points Expiration
 *   description: API endpoints for managing points expiration rules and processing expired points
 */

/**
 * @swagger
 * /points-expiration/rules:
 *   get:
 *     summary: Get current points expiration rules
 *     tags: [Points Expiration]
 *     responses:
 *       200:
 *         description: Points expiration rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Points expiration rules retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     default_expiry_period:
 *                       type: number
 *                       example: 12
 *                     tier_extensions:
 *                       type: object
 *                       properties:
 *                         silver:
 *                           type: number
 *                           example: 1
 *                         gold:
 *                           type: number
 *                           example: 3
 *                         platinum:
 *                           type: number
 *                           example: 6
 *                     expiry_notifications:
 *                       type: object
 *                       properties:
 *                         first_reminder:
 *                           type: number
 *                           example: 30
 *                         second_reminder:
 *                           type: number
 *                           example: 15
 *                         final_reminder:
 *                           type: number
 *                           example: 5
 *                     grace_period:
 *                       type: number
 *                       example: 7
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: No points expiration rules found
 *       500:
 *         description: Internal Server Error
 * 
 *   post:
 *     summary: Create or update points expiration rules
 *     tags: [Points Expiration]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - default_expiry_period
 *               - tier_extensions
 *               - expiry_notifications
 *               - grace_period
 *             properties:
 *               default_expiry_period:
 *                 type: number
 *                 example: 12
 *               tier_extensions:
 *                 type: object
 *                 properties:
 *                   silver:
 *                     type: number
 *                     example: 1
 *                   gold:
 *                     type: number
 *                     example: 3
 *                   platinum:
 *                     type: number
 *                     example: 6
 *               expiry_notifications:
 *                 type: object
 *                 properties:
 *                   first_reminder:
 *                     type: number
 *                     example: 30
 *                   second_reminder:
 *                     type: number
 *                     example: 15
 *                   final_reminder:
 *                     type: number
 *                     example: 5
 *               grace_period:
 *                 type: number
 *                 example: 7
 *     responses:
 *       200:
 *         description: Points expiration rules updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Points expiration rules updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/PointsExpirationRules'
 *       201:
 *         description: Points expiration rules created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Points expiration rules created successfully
 *                 data:
 *                   $ref: '#/components/schemas/PointsExpirationRules'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /points-expiration/users/{user_id}:
 *   get:
 *     summary: Get user's points with expiration information
 *     tags: [Points Expiration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User points retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                     points:
 *                       type: object
 *                       properties:
 *                         totalActivePoints:
 *                           type: number
 *                           example: 1500
 *                         expiringSoonPoints:
 *                           type: number
 *                           example: 300
 *                         expiryBreakdown:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                               points:
 *                                 type: number
 *                                 example: 100
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /points-expiration/process:
 *   post:
 *     summary: Process expired points (admin only)
 *     tags: [Points Expiration]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Expired points processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Expired points processed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalExpiredPoints:
 *                       type: number
 *                       example: 1500
 *                     expiredTransactions:
 *                       type: number
 *                       example: 25
 *                     affectedUsers:
 *                       type: number
 *                       example: 10
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /points-expiration/users/{user_id}/expiring-soon:
 *   get:
 *     summary: Get points expiring soon for a user
 *     tags: [Points Expiration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look ahead for expiring points
 *     responses:
 *       200:
 *         description: Expiring points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Expiring points retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalExpiringPoints:
 *                       type: number
 *                       example: 300
 *                     expiringPoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           points:
 *                             type: number
 *                             example: 100
 *                           transactions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: 60d21b4667d0d8992e610c85
 *                                 points:
 *                                   type: number
 *                                   example: 50
 *                                 transaction_date:
 *                                   type: string
 *                                   format: date-time
 *                                 expiry_date:
 *                                   type: string
 *                                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PointsExpirationRules:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c85
 *         default_expiry_period:
 *           type: number
 *           example: 12
 *         tier_extensions:
 *           type: object
 *           properties:
 *             silver:
 *               type: number
 *               example: 1
 *             gold:
 *               type: number
 *               example: 3
 *             platinum:
 *               type: number
 *               example: 6
 *         expiry_notifications:
 *           type: object
 *           properties:
 *             first_reminder:
 *               type: number
 *               example: 30
 *             second_reminder:
 *               type: number
 *               example: 15
 *             final_reminder:
 *               type: number
 *               example: 5
 *         grace_period:
 *           type: number
 *           example: 7
 *         is_active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
