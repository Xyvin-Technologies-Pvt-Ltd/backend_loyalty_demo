/**
 * @swagger
 * tags:
 *   - name: SDK
 *     description: API for managing SDK access keys and SDK operations
 */

/**
 * @swagger
 * /sdk/access-keys:
 *   post:
 *     summary: Create a new SDK access key
 *     description: Creates a new SDK access key for integration. Requires MANAGE_SDK permission.
 *     tags:
 *       - SDK
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
 *                 example: "Mobile App Integration"
 *               description:
 *                 type: string
 *                 example: "Access key for mobile app integration"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [
 *                     "MANAGE_POINTS",
 *                     "VIEW_CUSTOMERS",
 *                     "MANAGE_TRANSACTIONS"
 *                   ]
 *                 example: ["MANAGE_POINTS", "VIEW_CUSTOMERS"]
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *             required:
 *               - name
 *               - permissions
 *     responses:
 *       201:
 *         description: SDK access key created successfully
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
 *                   example: "SDK access key created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     name:
 *                       type: string
 *                       example: "Mobile App Integration"
 *                     key:
 *                       type: string
 *                       example: "sdk_1a2b3c4d5e6f7g8h9i0j"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["MANAGE_POINTS", "VIEW_CUSTOMERS"]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all SDK access keys
 *     description: Retrieves a list of all SDK access keys. Requires MANAGE_SDK permission.
 *     tags:
 *       - SDK
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, revoked]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: A list of SDK access keys
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
 *                   example: "SDK access keys retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_keys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           name:
 *                             type: string
 *                             example: "Mobile App Integration"
 *                           key_prefix:
 *                             type: string
 *                             example: "sdk_1a2b3c..."
 *                           status:
 *                             type: string
 *                             enum: [active, expired, revoked]
 *                             example: "active"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           expires_at:
 *                             type: string
 *                             format: date-time
 *                           last_used:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 5
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
 *                         pages:
 *                           type: number
 *                           example: 1
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/access-keys/{id}:
 *   get:
 *     summary: Get SDK access key details
 *     description: Retrieves details of a specific SDK access key. Requires MANAGE_SDK permission.
 *     tags:
 *       - SDK
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The SDK access key ID
 *     responses:
 *       200:
 *         description: SDK access key details
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
 *                   example: "SDK access key retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     name:
 *                       type: string
 *                       example: "Mobile App Integration"
 *                     key_prefix:
 *                       type: string
 *                       example: "sdk_1a2b3c..."
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["MANAGE_POINTS", "VIEW_CUSTOMERS"]
 *                     status:
 *                       type: string
 *                       enum: [active, expired, revoked]
 *                       example: "active"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                     last_used:
 *                       type: string
 *                       format: date-time
 *                     usage_stats:
 *                       type: object
 *                       properties:
 *                         total_requests:
 *                           type: number
 *                           example: 1250
 *                         last_24h:
 *                           type: number
 *                           example: 45
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: SDK access key not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update SDK access key
 *     description: Updates an existing SDK access key. Requires MANAGE_SDK permission.
 *     tags:
 *       - SDK
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The SDK access key ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Mobile App Integration"
 *               description:
 *                 type: string
 *                 example: "Updated access key for mobile app integration"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["MANAGE_POINTS", "VIEW_CUSTOMERS", "MANAGE_TRANSACTIONS"]
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: SDK access key updated successfully
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
 *                   example: "SDK access key updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     name:
 *                       type: string
 *                       example: "Updated Mobile App Integration"
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: SDK access key not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Revoke SDK access key
 *     description: Revokes an SDK access key, preventing its further use. Requires MANAGE_SDK permission.
 *     tags:
 *       - SDK
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The SDK access key ID
 *     responses:
 *       200:
 *         description: SDK access key revoked successfully
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
 *                   example: "SDK access key revoked successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: SDK access key not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/api/points/award:
 *   post:
 *     summary: Award points to a customer
 *     description: Awards points to a customer based on specified criteria. Requires SDK authentication.
 *     tags:
 *       - SDK
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c91"
 *               points:
 *                 type: number
 *                 example: 100
 *               reason:
 *                 type: string
 *                 example: "Purchase completion"
 *               reference_id:
 *                 type: string
 *                 example: "order_12345"
 *               metadata:
 *                 type: object
 *                 example: {
 *                   "order_value": 150,
 *                   "store_id": "store_123"
 *                 }
 *             required:
 *               - customer_id
 *               - points
 *               - reason
 *     responses:
 *       200:
 *         description: Points awarded successfully
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
 *                   example: "Points awarded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction_id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c92"
 *                     customer_id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c91"
 *                     points:
 *                       type: number
 *                       example: 100
 *                     current_balance:
 *                       type: number
 *                       example: 450
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/api/points/redeem:
 *   post:
 *     summary: Redeem points from a customer
 *     description: Redeems points from a customer's balance. Requires SDK authentication.
 *     tags:
 *       - SDK
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c91"
 *               points:
 *                 type: number
 *                 example: 50
 *               reason:
 *                 type: string
 *                 example: "Reward redemption"
 *               reference_id:
 *                 type: string
 *                 example: "reward_12345"
 *               metadata:
 *                 type: object
 *                 example: {
 *                   "reward_name": "Free Coffee",
 *                   "store_id": "store_123"
 *                 }
 *             required:
 *               - customer_id
 *               - points
 *               - reason
 *     responses:
 *       200:
 *         description: Points redeemed successfully
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
 *                   example: "Points redeemed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction_id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c93"
 *                     customer_id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c91"
 *                     points:
 *                       type: number
 *                       example: 50
 *                     current_balance:
 *                       type: number
 *                       example: 400
 *       400:
 *         description: Invalid input or insufficient points
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/api/customers/{id}:
 *   get:
 *     summary: Get customer details
 *     description: Retrieves details of a specific customer. Requires SDK authentication.
 *     tags:
 *       - SDK
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer details
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
 *                   example: "Customer retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c91"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     points_balance:
 *                       type: number
 *                       example: 400
 *                     tier:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c94"
 *                         name:
 *                           type: string
 *                           example: "Gold"
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/api/customers/{id}/transactions:
 *   get:
 *     summary: Get customer transactions
 *     description: Retrieves transaction history for a specific customer. Requires SDK authentication.
 *     tags:
 *       - SDK
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [earn, redeem, expire, adjust]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Customer transactions
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
 *                   example: "Customer transactions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c92"
 *                           type:
 *                             type: string
 *                             enum: [earn, redeem, expire, adjust]
 *                             example: "earn"
 *                           points:
 *                             type: number
 *                             example: 100
 *                           reason:
 *                             type: string
 *                             example: "Purchase completion"
 *                           reference_id:
 *                             type: string
 *                             example: "order_12345"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 25
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
 *                         pages:
 *                           type: number
 *                           example: 3
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */
