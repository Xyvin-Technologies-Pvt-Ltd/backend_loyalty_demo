/**
 * @swagger
 * tags:
 *   - name: Logs
 *     description: API for accessing and managing system logs
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get system logs
 *     description: Retrieves system logs with filtering and pagination. Requires VIEW_LOGS permission.
 *     tags:
 *       - Logs
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug]
 *         description: Filter by log level
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter logs by message content
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: timestamp
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of system logs
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
 *                   example: "Logs retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           level:
 *                             type: string
 *                             example: "info"
 *                           message:
 *                             type: string
 *                             example: "User logged in successfully"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           meta:
 *                             type: object
 *                             properties:
 *                               user_id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c91"
 *                               ip:
 *                                 type: string
 *                                 example: "192.168.1.1"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 100
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 20
 *                         pages:
 *                           type: number
 *                           example: 5
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /logs/export:
 *   get:
 *     summary: Export system logs
 *     description: Exports system logs as CSV file with filtering. Requires EXPORT_LOGS permission.
 *     tags:
 *       - Logs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug]
 *         description: Filter by log level
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter logs by message content
 *     responses:
 *       200:
 *         description: CSV file containing logs
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /logs/clear:
 *   delete:
 *     summary: Clear system logs
 *     description: Clears system logs older than the specified date. Requires MANAGE_LOGS permission.
 *     tags:
 *       - Logs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               older_than:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *                 description: Clear logs older than this date (YYYY-MM-DD)
 *             required:
 *               - older_than
 *     responses:
 *       200:
 *         description: Logs cleared successfully
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
 *                   example: "Logs cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_count:
 *                       type: number
 *                       example: 50
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */
