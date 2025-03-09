/**
 * @swagger
 * tags:
 *   - name: Segmentation
 *     description: API for managing customer segments in the loyalty system
 */

/**
 * @swagger
 * /segments:
 *   post:
 *     summary: Create a new customer segment
 *     description: Creates a new customer segment based on specified criteria. Requires MANAGE_SEGMENTS permission.
 *     tags:
 *       - Segmentation
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "High Value Customers"
 *               description:
 *                 type: string
 *                 example: "Customers who have spent over $1000 in the last 90 days"
 *               type:
 *                 type: string
 *                 enum: ["transaction", "engagement", "app_type", "device", "custom"]
 *                 example: "transaction"
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive", "draft"]
 *                 example: "active"
 *               criteria:
 *                 type: object
 *                 properties:
 *                   transaction:
 *                     type: object
 *                     properties:
 *                       min_transactions:
 *                         type: number
 *                         example: 5
 *                       min_spend:
 *                         type: number
 *                         example: 1000
 *                       transaction_period:
 *                         type: string
 *                         enum: ["last_7_days", "last_30_days", "last_90_days", "last_year", "all_time"]
 *                         example: "last_90_days"
 *                       transaction_types:
 *                         type: array
 *                         items:
 *                           type: string
 *                           enum: ["earn", "redeem", "expire", "adjust"]
 *                         example: ["earn"]
 *               auto_refresh:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   frequency:
 *                     type: string
 *                     enum: ["hourly", "daily", "weekly"]
 *                     example: "daily"
 *             required:
 *               - name
 *               - type
 *               - criteria
 *     responses:
 *       201:
 *         description: Customer segment created successfully
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
 *                   example: "Customer segment created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     name:
 *                       type: string
 *                       example: "High Value Customers"
 *                     type:
 *                       type: string
 *                       example: "transaction"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Invalid input or segment name already exists
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all customer segments
 *     description: Retrieves a list of all customer segments with pagination and filtering. Requires MANAGE_SEGMENTS permission.
 *     tags:
 *       - Segmentation
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by segment name (case-insensitive partial match)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["transaction", "engagement", "app_type", "device", "custom"]
 *         description: Filter by segment type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["active", "inactive", "draft"]
 *         description: Filter by segment status
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: createdAt
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
 *         description: A list of customer segments
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
 *                   example: "Customer segments retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     segments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           name:
 *                             type: string
 *                             example: "High Value Customers"
 *                           type:
 *                             type: string
 *                             example: "transaction"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           customer_count:
 *                             type: number
 *                             example: 250
 *                           last_refreshed:
 *                             type: string
 *                             format: date-time
 *                     type_stats:
 *                       type: object
 *                       properties:
 *                         transaction:
 *                           type: number
 *                           example: 5
 *                         engagement:
 *                           type: number
 *                           example: 3
 *                         app_type:
 *                           type: number
 *                           example: 2
 *                         device:
 *                           type: number
 *                           example: 1
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 11
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
 *                         pages:
 *                           type: number
 *                           example: 2
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /segments/{id}:
 *   get:
 *     summary: Get a specific customer segment
 *     description: Retrieves a specific customer segment by ID, including sample members. Requires MANAGE_SEGMENTS permission.
 *     tags:
 *       - Segmentation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The segment ID
 *     responses:
 *       200:
 *         description: Customer segment details
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
 *                   example: "Customer segment retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     segment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c90"
 *                         name:
 *                           type: string
 *                           example: "High Value Customers"
 *                         description:
 *                           type: string
 *                           example: "Customers who have spent over $1000 in the last 90 days"
 *                         type:
 *                           type: string
 *                           example: "transaction"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         criteria:
 *                           type: object
 *                         customer_count:
 *                           type: number
 *                           example: 250
 *                         last_refreshed:
 *                           type: string
 *                           format: date-time
 *                         auto_refresh:
 *                           type: object
 *                           properties:
 *                             enabled:
 *                               type: boolean
 *                               example: true
 *                             frequency:
 *                               type: string
 *                               example: "daily"
 *                     sample_members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           customer:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           added_at:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer segment not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update a customer segment
 *     description: Updates an existing customer segment. Requires MANAGE_SEGMENTS permission.
 *     tags:
 *       - Segmentation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "High Value Customers - Updated"
 *               description:
 *                 type: string
 *                 example: "Customers who have spent over $1500 in the last 90 days"
 *               type:
 *                 type: string
 *                 enum: ["transaction", "engagement", "app_type", "device", "custom"]
 *                 example: "transaction"
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive", "draft"]
 *                 example: "active"
 *               criteria:
 *                 type: object
 *                 properties:
 *                   transaction:
 *                     type: object
 *                     properties:
 *                       min_transactions:
 *                         type: number
 *                         example: 5
 *                       min_spend:
 *                         type: number
 *                         example: 1500
 *                       transaction_period:
 *                         type: string
 *                         enum: ["last_7_days", "last_30_days", "last_90_days", "last_year", "all_time"]
 *                         example: "last_90_days"
 *               auto_refresh:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   frequency:
 *                     type: string
 *                     enum: ["hourly", "daily", "weekly"]
 *                     example: "daily"
 *     responses:
 *       200:
 *         description: Customer segment updated successfully
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
 *                   example: "Customer segment updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     name:
 *                       type: string
 *                       example: "High Value Customers - Updated"
 *       400:
 *         description: Invalid input or segment name already exists
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer segment not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete a customer segment
 *     description: Deletes a customer segment and all its memberships. Requires MANAGE_SEGMENTS permission.
 *     tags:
 *       - Segmentation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The segment ID
 *     responses:
 *       200:
 *         description: Customer segment deleted successfully
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
 *                   example: "Customer segment deleted successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer segment not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /segments/{id}/customers:
 *   get:
 *     summary: Get customers in a segment
 *     description: Retrieves a list of customers in a specific segment with pagination. Requires MANAGE_SEGMENTS permission.
 *     tags:
 *       - Segmentation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The segment ID
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: added_at
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
 *         description: Customers in segment
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
 *                   example: "Segment customers retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     segment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c90"
 *                         name:
 *                           type: string
 *                           example: "High Value Customers"
 *                         type:
 *                           type: string
 *                           example: "transaction"
 *                         customer_count:
 *                           type: number
 *                           example: 250
 *                         last_refreshed:
 *                           type: string
 *                           format: date-time
 *                     customers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c91"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           phone:
 *                             type: string
 *                             example: "+1234567890"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           added_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 250
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
 *                         pages:
 *                           type: number
 *                           example: 25
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer segment not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /segments/{id}/refresh:
 *   post:
 *     summary: Refresh a segment
 *     description: Manually triggers a refresh of a segment to update its members based on current criteria. Requires MANAGE_SEGMENTS permission.
 *     tags:
 *       - Segmentation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The segment ID
 *     responses:
 *       200:
 *         description: Segment refresh started successfully
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
 *                   example: "Segment refresh started successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer segment not found
 *       500:
 *         description: Internal Server Error
 */
