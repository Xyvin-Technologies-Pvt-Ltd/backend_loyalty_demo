
/**
 * @swagger
 * tags:
 *   - name: Kedmah Offers
 *     description: API for managing Kedmah offers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     KedmahOffer:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - appType
 *         - serviceCategory
 *         - offerType
 *         - posterImage
 *         - validityPeriod
 *         - usagePolicy
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the Kedmah offer
 *         description:
 *           type: string
 *           description: Detailed description of the offer
 *         appType:
 *           type: string
 *           description: ID of the app type where offer is valid
 *         serviceCategory:
 *           type: string
 *           description: ID of the service category
 *         offerType:
 *           type: string
 *           enum: [DISCOUNT, FLAT_OFFER]
 *           description: Type of Kedmah offer
 *         posterImage:
 *           type: string
 *           description: URL of the offer image
 *         validityPeriod:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *         discountDetails:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [PERCENTAGE, FIXED]
 *             value:
 *               type: number
 *         usagePolicy:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               enum: [DAILY, WEEKLY, MONTHLY, TOTAL]
 *             maxUsagePerPeriod:
 *               type: number
 *             userLimit:
 *               type: number
 *         eligibilityCriteria:
 *           type: object
 *           properties:
 *             userTypes:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [NEW, EXISTING, PREMIUM, ALL]
 *             tiers:
 *               type: array
 *               items:
 *                 type: string
 *             minTransactionHistory:
 *               type: number
 *             minPointsBalance:
 *               type: number
 *
 * @swagger
 * /kedmah-offers:
 *   post:
 *     summary: Create a new Kedmah offer
 *     tags: [Kedmah Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KedmahOffer'
 *     responses:
 *       201:
 *         description: Kedmah offer created successfully
 *
 *   get:
 *     summary: List all Kedmah offers
 *     tags: [Kedmah Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offerType
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of Kedmah offers
 *
 * @swagger
 * /kedmah-offers/check-eligibility:
 *   post:
 *     summary: Check user eligibility for an offer
 *     tags: [Kedmah Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offerId
 *               - customerId   
 *               - transactionValue
 *               - paymentMethod
 *             properties:
 *               offerId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               transactionValue:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Eligibility check result
 *
 * @swagger
 * /kedmah-offers/customer/{customerId}:
 *   get:
 *     summary: Get offers available for a specific user
 *     tags: [Kedmah Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: appType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of eligible offers for the user
 */