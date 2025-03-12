/**
 * @swagger
 * tags:
 *   - name: SDK Customer
 *     description: SDK APIs for customer operations in the loyalty system
 */

/**
 * @swagger
 * /sdk/customer/register:
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
 * /sdk/customer/{customerId}/profile:
 *   get:
 *     summary: Get customer profile
 *     description: Retrieve complete customer profile including tier, points, and wallet information
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
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
 * /sdk/customer/{customerId}/transactions:
 *   get:
 *     summary: Get customer transactions
 *     description: Retrieve customer's point and coin transactions with pagination
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
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
 * /sdk/customer/{customerId}/points/statement:
 *   get:
 *     summary: Get points statement
 *     description: Retrieve monthly statement of points including earned, spent, and expired points
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: integer
 *                 year:
 *                   type: integer
 *                 openingBalance:
 *                   type: number
 *                 pointsEarned:
 *                   type: number
 *                 pointsSpent:
 *                   type: number
 *                 pointsExpired:
 *                   type: number
 *                 closingBalance:
 *                   type: number
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       type:
 *                         type: string
 *                       points:
 *                         type: number
 *                       description:
 *                         type: string
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/trigger-points:
 *   post:
 *     summary: Trigger points for customer activity
 *     description: Trigger points allocation when a customer completes a qualifying activity or payment
 *     tags:
 *       - SDK Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - eventType
 *               - transactionDetails
 *             properties:
 *               customerId:
 *                 type: string
 *               eventType:
 *                 type: string
 *                 enum: [payment, activity, service]
 *               transactionDetails:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   paymentMethod:
 *                     type: string
 *                   serviceType:
 *                     type: string
 *                   referenceId:
 *                     type: string
 *                   metadata:
 *                     type: object
 *     responses:
 *       200:
 *         description: Points allocated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pointsAwarded:
 *                   type: number
 *                 newTotalPoints:
 *                   type: number
 *                 tierProgress:
 *                   type: object
 *                   properties:
 *                     currentTier:
 *                       type: string
 *                     pointsToNextTier:
 *                       type: number
 *       400:
 *         description: Invalid input or transaction
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/{customerId}/redeem:
 *   post:
 *     summary: Redeem points
 *     description: Redeem points for purchases, coupons, or offers
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - redeemType
 *               - pointsToRedeem
 *             properties:
 *               redeemType:
 *                 type: string
 *                 enum: [purchase, coupon, offer]
 *               pointsToRedeem:
 *                 type: number
 *               itemDetails:
 *                 type: object
 *                 properties:
 *                   itemId:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   metadata:
 *                     type: object
 *     responses:
 *       200:
 *         description: Points redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redemptionId:
 *                   type: string
 *                 pointsRedeemed:
 *                   type: number
 *                 remainingPoints:
 *                   type: number
 *                 redemptionDetails:
 *                   type: object
 *       400:
 *         description: Invalid redemption request or insufficient points
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/{customerId}/wallet:
 *   post:
 *     summary: Manage wallet coins
 *     description: Add or remove coins from customer wallet
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *               - amount
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [add, remove]
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Wallet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionId:
 *                   type: string
 *                 newBalance:
 *                   type: number
 *                 operation:
 *                   type: string
 *                 amount:
 *                   type: number
 *       400:
 *         description: Invalid operation or insufficient balance
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/{customerId}/convert:
 *   post:
 *     summary: Convert between coins and points
 *     description: Convert coins to points or points to coins based on conversion rules
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversionType
 *               - amount
 *             properties:
 *               conversionType:
 *                 type: string
 *                 enum: [coinsToPoints, pointsToCoins]
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Conversion completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionId:
 *                   type: string
 *                 convertedAmount:
 *                   type: number
 *                 newPointsBalance:
 *                   type: number
 *                 newCoinsBalance:
 *                   type: number
 *       400:
 *         description: Invalid conversion request or insufficient balance
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/{customerId}/redeem/eligibility:
 *   get:
 *     summary: Check redemption eligibility
 *     description: Check if a customer is eligible for specific redemption options
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: redeemType
 *         schema:
 *           type: string
 *           enum: [purchase, coupon, offer]
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Eligibility check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isEligible:
 *                   type: boolean
 *                 requiredPoints:
 *                   type: number
 *                 availablePoints:
 *                   type: number
 *                 restrictions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [tier, time, location, limit]
 *                       message:
 *                         type: string
 *       404:
 *         description: Customer or item not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/{customerId}/offers:
 *   get:
 *     summary: Get available offers
 *     description: Retrieve all available offers and rewards for the customer
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, coupon, discount, reward]
 *           default: all
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
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       offerId:
 *                         type: string
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       pointsRequired:
 *                         type: number
 *                       validUntil:
 *                         type: string
 *                         format: date-time
 *                       isEligible:
 *                         type: boolean
 *                       restrictions:
 *                         type: array
 *                         items:
 *                           type: string
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
 * /sdk/customer/{customerId}/points/expiring:
 *   get:
 *     summary: Get expiring points
 *     description: Get details of points that will expire soon
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: daysThreshold
 *         schema:
 *           type: integer
 *           default: 30
 *           description: Get points expiring within these many days
 *     responses:
 *       200:
 *         description: Expiring points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expiringPoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       points:
 *                         type: number
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *                       daysRemaining:
 *                         type: integer
 *                       source:
 *                         type: string
 *                         description: Source of points (e.g., purchase, bonus)
 *                 totalExpiringPoints:
 *                   type: number
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/{customerId}/tier/progress:
 *   get:
 *     summary: Get tier progress
 *     description: Get detailed progress towards next tier and tier benefits
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tier progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentTier:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     benefits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           value:
 *                             type: string
 *                 nextTier:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     pointsRequired:
 *                       type: number
 *                     pointsToNext:
 *                       type: number
 *                     additionalBenefits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           value:
 *                             type: string
 *                 progress:
 *                   type: object
 *                   properties:
 *                     percentage:
 *                       type: number
 *                     pointsEarned:
 *                       type: number
 *                     targetPoints:
 *                       type: number
 *                     remainingPoints:
 *                       type: number
 *                     estimatedAchievement:
 *                       type: string
 *                       format: date
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sdk/customer/{customerId}/notifications/preferences:
 *   get:
 *     summary: Get notification preferences
 *     description: Get customer's notification preferences for different types of alerts
 *     tags:
 *       - SDK Customer
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *         name: customerId
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
