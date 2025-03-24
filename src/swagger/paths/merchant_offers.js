/**
 * @swagger
 * tags:
 *   - name: Merchant Offers
 *     description: API for managing merchant offers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MerchantOffer:
 *       type: object
 *       required:
 *         - code
 *         - title
 *         - description
 *         - merchantId
 *         - appType
 *         - type
 *         - posterImage
 *         - validityPeriod
 *         - discountDetails
 *         - usagePolicy
 *         - conditions
 *         - termsAndConditions
 *         - redemptionInstructions
 *         - isActive
 *       properties:
 *         code:
 *           type: string
 *           description: Unique code for the coupon
 *         title:
 *           type: string
 *           description: Title of the offer
 *         description:
 *           type: string
 *           description: Detailed description of the offer
 *         merchantId:
 *           type: string
 *           description: ID of the merchant offering the coupon
 *         appType:
 *           type: string
 *           description: ID of the app type where offer is valid
 *         type:
 *           type: string
 *           enum: [PRE_GENERATED, DYNAMIC, ONE_TIME_LINK]
 *           description: Type of coupon
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
 *               enum: [DAILY, WEEKLY, BIWEEKLY, MONTHLY]
 *             maxUsagePerPeriod:
 *               type: number
 *             maxTotalUsage:
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
 *             minPointsBalance:
 *               type: number
 *             minTransactionHistory:
 *               type: number
 *             minTransactionValue:
 *               type: number
 *             maxTransactionValue:
 *               type: number
 *             applicablePaymentMethods:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [Khedmah-site, KhedmahPay-Wallet, ALL]
 *             appType:
 *               type: array
 * @swagger
 * /merchant-offers/pre-generated:
 *   post:
 *     summary: Create pre-generated coupons
 *     tags: [Merchant Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coupons
 *               - merchantId
 *             properties:
 *               coupons:
 *                 type: array
 *                 items:
 *                   type: string
 *               merchantId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coupons created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 * @swagger
 * /merchant-offers/dynamic:
 *   post:
 *     summary: Generate a dynamic coupon
 *     tags: [Merchant Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MerchantOffer'
 *     responses:
 *       201:
 *         description: Dynamic coupon generated successfully
 *
 * @swagger
 * /merchant-offers/validate:
 *   post:
 *     summary: Validate a coupon
 *     tags: [Merchant Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - merchantId
 *               - customerId
 *               - transactionValue
 *               - paymentMethod
 *             properties:
 *               code:
 *                 type: string
 *               merchantId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               transactionValue:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon validated successfully
 *       400:
 *         description: Invalid coupon or conditions not met
 */