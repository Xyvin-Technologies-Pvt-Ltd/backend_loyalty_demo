/**
 * @swagger
 * tags:
 *   name: Conversion
 *   description: Points to coins conversion management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConversionRule:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The conversion rule ID
 *         name:
 *           type: string
 *           description: Name of the conversion rule
 *           example: "Standard Conversion"
 *         description:
 *           type: string
 *           description: Description of the conversion rule
 *           example: "Standard points to coins conversion rate"
 *         conversionRate:
 *           type: number
 *           description: Number of points required for 1 coin
 *           example: 10
 *         minPointsRequired:
 *           type: number
 *           description: Minimum points required to convert
 *           example: 100
 *         maxPointsPerConversion:
 *           type: number
 *           description: Maximum points allowed per conversion (0 for unlimited)
 *           example: 0
 *         bonusPercentage:
 *           type: number
 *           description: Bonus percentage added to conversion
 *           example: 0
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Start date for this conversion rule
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: End date for this conversion rule (null for no end date)
 *         isActive:
 *           type: boolean
 *           description: Whether the rule is active
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the rule was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the rule was last updated
 *
 *     ConversionHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The conversion history ID
 *         user:
 *           type: string
 *           description: ID of the user who performed the conversion
 *         points:
 *           type: number
 *           description: Number of points converted
 *           example: 5000
 *         coins:
 *           type: number
 *           description: Number of coins received (base amount)
 *           example: 500
 *         bonus:
 *           type: number
 *           description: Number of bonus coins received
 *           example: 50
 *         conversionRate:
 *           type: string
 *           description: Rate at which points were converted
 *           example: "1:10"
 *         conversionRule:
 *           type: string
 *           description: ID of the conversion rule used
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *           description: Status of the conversion
 *           example: "completed"
 *         transactionId:
 *           type: string
 *           description: Unique transaction ID for the conversion
 *           example: "CONV-1646123456789-123"
 *         notes:
 *           type: string
 *           description: Additional notes about the conversion
 *         processedBy:
 *           type: string
 *           description: ID of the admin who processed the conversion (if applicable)
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: When the conversion was processed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the conversion was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the conversion was last updated
 */
