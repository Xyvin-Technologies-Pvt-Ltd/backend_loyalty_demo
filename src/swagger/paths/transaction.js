/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: API for managing point transactions in the loyalty system
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new point transaction in the system. Requires MANAGE_POINTS permission.
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 description: ID of the customer
 *                 example: "60d21b4667d0d8992e610c85"
 *               transaction_type:
 *                 type: string
 *                 enum: ["earn", "redeem", "expire", "adjust", "transfer"]
 *                 example: "earn"
 *               source:
 *                 type: string
 *                 enum: ["purchase", "referral", "registration", "social_share", "review", "login", "bill_payment", "recharge", "birthday", "manual_adjustment", "redemption", "expiration", "tier_upgrade", "special_event", "other"]
 *                 example: "purchase"
 *               points:
 *                 type: number
 *                 description: Number of points (positive for earn, negative for redeem/expire)
 *                 example: 100
 *               trigger_event:
 *                 type: string
 *                 description: ID of the trigger event
 *                 example: "60d21b4667d0d8992e610c86"
 *               trigger_service:
 *                 type: string
 *                 description: ID of the trigger service
 *                 example: "60d21b4667d0d8992e610c87"
 *               point_criteria:
 *                 type: string
 *                 description: ID of the point criteria
 *                 example: "60d21b4667d0d8992e610c88"
 *               app_type:
 *                 type: string
 *                 description: ID of the app type
 *                 example: "60d21b4667d0d8992e610c89"
 *               note:
 *                 type: string
 *                 description: Additional note about the transaction
 *                 example: "Points earned from retail purchase"
 *               reference_id:
 *                 type: string
 *                 description: Reference ID of the original action
 *                 example: "POS12345"
 *               metadata:
 *                 type: object
 *                 description: Additional metadata about the transaction
 *                 example:
 *                   purchase_amount: 500
 *                   store_id: "STORE001"
 *             required:
 *               - customer_id
 *               - transaction_type
 *               - points
 *     responses:
 *       201:
 *         description: Transaction created successfully
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
 *                   example: "Transaction created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     customer_id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     transaction_type:
 *                       type: string
 *                       example: "earn"
 *                     source:
 *                       type: string
 *                       example: "purchase"
 *                     points:
 *                       type: number
 *                       example: 100
 *                     transaction_id:
 *                       type: string
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                     status:
 *                       type: string
 *                       example: "completed"
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
 *     summary: Get all transactions
 *     description: Retrieves a list of all transactions with pagination and filtering. Requires VIEW_TRANSACTIONS permission.
 *     tags:
 *       - Transactions
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
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: transaction_type
 *         schema:
 *           type: string
 *           enum: ["earn", "redeem", "expire", "adjust", "transfer"]
 *         description: Filter by transaction type
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["pending", "completed", "rejected", "cancelled", "failed", "expired"]
 *         description: Filter by status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: transaction_date
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of transactions
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
 *                   example: "Transactions retrieved successfully"
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
 *                             example: "60d21b4667d0d8992e610c90"
 *                           customer_id:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c85"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john@example.com"
 *                           transaction_type:
 *                             type: string
 *                             example: "earn"
 *                           points:
 *                             type: number
 *                             example: 100
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           transaction_date:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 50
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
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
 * /transactions/{id}:
 *   get:
 *     summary: Get a specific transaction
 *     description: Retrieves a specific transaction by ID. Requires VIEW_TRANSACTIONS permission.
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
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
 *                   example: "Transaction retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     customer_id:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c85"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                     transaction_type:
 *                       type: string
 *                       example: "earn"
 *                     source:
 *                       type: string
 *                       example: "purchase"
 *                     points:
 *                       type: number
 *                       example: 100
 *                     transaction_id:
 *                       type: string
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     transaction_date:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /transactions/{id}/status:
 *   patch:
 *     summary: Update a transaction's status
 *     description: Updates the status of a transaction. Requires MANAGE_POINTS permission.
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["pending", "completed", "rejected", "cancelled", "failed", "expired"]
 *                 example: "completed"
 *               note:
 *                 type: string
 *                 example: "Transaction approved by admin"
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
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
 *                   example: "Transaction status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /transactions/customer/{customerId}:
 *   get:
 *     summary: Get transactions for a specific customer
 *     description: Retrieves all transactions for a specific customer with pagination and filtering, along with a comprehensive points summary. Requires VIEW_TRANSACTIONS permission.
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *         name: transaction_type
 *         schema:
 *           type: string
 *           enum: ["earn", "redeem", "expire", "adjust", "transfer"]
 *         description: Filter by transaction type
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["pending", "completed", "rejected", "cancelled", "failed", "expired"]
 *         description: Filter by status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
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
 *                             example: "60d21b4667d0d8992e610c90"
 *                           transaction_type:
 *                             type: string
 *                             example: "earn"
 *                           points:
 *                             type: number
 *                             example: 100
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           transaction_date:
 *                             type: string
 *                             format: date-time
 *                     points_summary:
 *                       type: object
 *                       properties:
 *                         total_earned:
 *                           type: number
 *                           example: 500
 *                           description: Total points earned by the customer
 *                         total_spent:
 *                           type: number
 *                           example: 200
 *                           description: Total points spent on redemptions
 *                         total_expired:
 *                           type: number
 *                           example: 50
 *                           description: Total points that have expired
 *                         total_adjusted:
 *                           type: number
 *                           example: 25
 *                           description: Total points from manual adjustments (can be positive or negative)
 *                         current_balance:
 *                           type: number
 *                           example: 275
 *                           description: Current available point balance (earned - spent - expired + adjusted)
 *                         expiring_in_30_days:
 *                           type: number
 *                           example: 100
 *                           description: Points that will expire in the next 30 days
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 20
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
 * /transactions/customer/{customerId}/balance:
 *   get:
 *     summary: Get point balance for a customer
 *     description: Retrieves the current point balance and summary for a specific customer, including earned, spent, expired, and adjusted points. Requires VIEW_TRANSACTIONS permission.
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer point balance
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
 *                   example: "Customer point balance retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     points_summary:
 *                       type: object
 *                       properties:
 *                         total_earned:
 *                           type: number
 *                           example: 500
 *                           description: Total points earned by the customer
 *                         total_spent:
 *                           type: number
 *                           example: 200
 *                           description: Total points spent on redemptions
 *                         total_expired:
 *                           type: number
 *                           example: 50
 *                           description: Total points that have expired
 *                         total_adjusted:
 *                           type: number
 *                           example: 25
 *                           description: Total points from manual adjustments (can be positive or negative)
 *                         current_balance:
 *                           type: number
 *                           example: 275
 *                           description: Current available point balance (earned - spent - expired + adjusted)
 *                         expiring_in_30_days:
 *                           type: number
 *                           example: 100
 *                           description: Points that will expire in the next 30 days
 *                     recent_transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           transaction_type:
 *                             type: string
 *                             example: "earn"
 *                           points:
 *                             type: number
 *                             example: 100
 *                           transaction_date:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */
