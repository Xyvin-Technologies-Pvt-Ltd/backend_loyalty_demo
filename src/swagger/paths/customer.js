/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: API for managing customers in the loyalty system
 */

/**
 * @swagger
 * /customer:
 *   post:
 *     summary: Create a new customer
 *     description: Creates a new customer in the system. Requires EDIT_CUSTOMERS permission.
 *     tags:
 *       - Customers
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
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               app_type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c85"]
 *             required:
 *               - name
 *               - email
 *               - phone
 *     responses:
 *       201:
 *         description: Customer created successfully
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
 *                   example: "Customer created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     customer_id:
 *                       type: string
 *                       example: "CUST000001"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     referral_code:
 *                       type: string
 *                       example: "JOHXYZ123"
 *       400:
 *         description: Invalid input or customer already exists
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all customers
 *     description: Retrieves a list of all customers with pagination and filtering. Requires VIEW_CUSTOMERS permission.
 *     tags:
 *       - Customers
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
 *         description: Filter by customer name (case-insensitive partial match)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by customer email (case-insensitive partial match)
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by customer phone (case-insensitive partial match)
 *       - in: query
 *         name: app_type
 *         schema:
 *           type: string
 *         description: Filter by app type ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter by customer status (true for active, false for inactive)
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
 *         description: A list of customers
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
 *                   example: "Customers retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     customers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           customer_id:
 *                             type: string
 *                             example: "CUST000001"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           phone:
 *                             type: string
 *                             example: "+1234567890"
 *                           tier:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c91"
 *                               name:
 *                                 type: string
 *                                 example: "Gold"
 *                           status:
 *                             type: boolean
 *                             example: true
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
 * /customer/{id}:
 *   get:
 *     summary: Get a specific customer
 *     description: Retrieves a specific customer by ID. Requires VIEW_CUSTOMERS permission.
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
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
 *                       example: "60d21b4667d0d8992e610c90"
 *                     customer_id:
 *                       type: string
 *                       example: "CUST000001"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     tier:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c91"
 *                         name:
 *                           type: string
 *                           example: "Gold"
 *                         description:
 *                           type: string
 *                           example: "Gold tier with premium benefits"
 *                         points_required:
 *                           type: number
 *                           example: 1000
 *                     referral_code:
 *                       type: string
 *                       example: "JOHXYZ123"
 *                     status:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update a customer
 *     description: Updates an existing customer. Requires EDIT_CUSTOMERS permission.
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1987654321"
 *               app_type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c85"]
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Customer updated successfully
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
 *                   example: "Customer updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     name:
 *                       type: string
 *                       example: "John Doe Updated"
 *                     email:
 *                       type: string
 *                       example: "john.updated@example.com"
 *       400:
 *         description: Invalid input or email/phone already in use
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete a customer
 *     description: Soft deletes a customer by setting their status to inactive. Requires DELETE_CUSTOMERS permission.
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer deactivated successfully
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
 *                   example: "Customer deactivated successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /customer/{id}/dashboard:
 *   get:
 *     summary: Get customer dashboard
 *     description: Retrieves a comprehensive dashboard for a specific customer, including points summary, tier progress, and recent transactions. Requires VIEW_CUSTOMERS permission.
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer dashboard retrieved successfully
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
 *                   example: "Customer dashboard retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c90"
 *                         customer_id:
 *                           type: string
 *                           example: "CUST000001"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                         tier:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "60d21b4667d0d8992e610c91"
 *                             name:
 *                               type: string
 *                               example: "Gold"
 *                         referral_code:
 *                           type: string
 *                           example: "JOHXYZ123"
 *                         status:
 *                           type: boolean
 *                           example: true
 *                     points_summary:
 *                       type: object
 *                       properties:
 *                         total_earned:
 *                           type: number
 *                           example: 1500
 *                           description: Total points earned by the customer
 *                         total_spent:
 *                           type: number
 *                           example: 500
 *                           description: Total points spent on redemptions
 *                         total_expired:
 *                           type: number
 *                           example: 100
 *                           description: Total points that have expired
 *                         current_balance:
 *                           type: number
 *                           example: 900
 *                           description: Current available point balance
 *                         expiring_in_30_days:
 *                           type: number
 *                           example: 200
 *                           description: Points that will expire in the next 30 days
 *                     tier_progress:
 *                       type: object
 *                       properties:
 *                         current_tier:
 *                           type: string
 *                           example: "Gold"
 *                         progress_percentage:
 *                           type: number
 *                           example: 45
 *                           description: Percentage progress towards the next tier
 *                     referrals:
 *                       type: object
 *                       properties:
 *                         referral_code:
 *                           type: string
 *                           example: "JOHXYZ123"
 *                         total_referrals:
 *                           type: number
 *                           example: 5
 *                     recent_transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c92"
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
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */
