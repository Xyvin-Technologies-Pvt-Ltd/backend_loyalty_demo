/**
 * @swagger
 * tags:
 *   - name: SDK Customer
 *     description: SDK APIs for customer operations in the loyalty system
 */

/**
 * @swagger
 * /customer/register:
 *   post:
 *     summary: Register a new customer
 *     description: Register a customer in the loyalty system when they first login/register in the client app
 *     tags:
 *       - SDK Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - customerDetails
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: Unique identifier of the client
 *               customerDetails:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other]
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customerId:
 *                   type: string
 *                 loyaltyId:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Customer already exists
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /customer/{customer_id}/profile:
 *   get:
 *     summary: Get customer profile
 *     description: Retrieve complete customer profile including tier, points, and wallet information
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customerInfo:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                 tierInfo:
 *                   type: object
 *                   properties:
 *                     currentTier:
 *                       type: string
 *                     nextTier:
 *                       type: string
 *                     pointsToNextTier:
 *                       type: number
 *                 pointsInfo:
 *                   type: object
 *                   properties:
 *                     totalPoints:
 *                       type: number
 *                     availablePoints:
 *                       type: number
 *                     pendingPoints:
 *                       type: number
 *                     expiringSoonPoints:
 *                       type: number
 *                 walletInfo:
 *                   type: object
 *                   properties:
 *                     totalCoins:
 *                       type: number
 *                     availableCoins:
 *                       type: number
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /customer/{customer_id}/transactions:
 *   get:
 *     summary: Get customer transactions
 *     description: Retrieve customer's point and coin transactions with pagination
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [points, coins, all]
 *           default: all
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       transactionId:
 *                         type: string
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       description:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /customer/{customer_id}/points:
 *   get:
 *     summary: Get customer points
 *     description: Retrieve customer's points information
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPoints:
 *                   type: number
 *                 availablePoints:
 *                   type: number
 *                 pendingPoints:
 *                   type: number
 *                 expiringSoonPoints:
 *                   type: number
 *                 pointsHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       points:
 *                         type: number
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /customer/{customer_id}/notification-preferences:
 *   get:
 *     summary: Get notification preferences
 *     description: Get customer's notification preferences for different types of alerts
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     pointsExpiration:
 *                       type: boolean
 *                     tierUpdates:
 *                       type: boolean
 *                     newOffers:
 *                       type: boolean
 *                     transactionAlerts:
 *                       type: boolean
 *                     marketingCommunications:
 *                       type: boolean
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 *   put:
 *     summary: Update notification preferences
 *     description: Update customer's notification preferences
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsExpiration:
 *                 type: boolean
 *               tierUpdates:
 *                 type: boolean
 *               newOffers:
 *                 type: boolean
 *               transactionAlerts:
 *                 type: boolean
 *               marketingCommunications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedPreferences:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */
