/**
 * @swagger
 * tags:
 *   name: CoinConversion
 *   description: Points to coins conversion management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CoinConversionRule:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The conversion rule ID
 *         pointsPerCoin:
 *           type: number
 *           description: Number of points required per coin
 *           example: 10
 *         minimumPoints:
 *           type: number
 *           description: Minimum points required for conversion
 *           example: 100
 *         updatedBy:
 *           type: string
 *           description: ID of the admin who updated the rule
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
 */

/**
 * @swagger
 * /coin-conversion:
 *   post:
 *     summary: Create or update the coin conversion rule
 *     description: If a rule exists, updates it; otherwise, creates a new one.
 *     tags:
 *       - CoinConversion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsPerCoin:
 *                 type: number
 *                 example: 10
 *               minimumPoints:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Coin conversion rule updated successfully
 *       201:
 *         description: Coin conversion rule created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /coin-conversion:
 *   get:
 *     summary: Get all coin conversion rules
 *     description: Retrieves all coin conversion rules
 *     tags:
 *       - CoinConversion
 *     responses:
 *       200:
 *         description: Successfully retrieved all conversion rules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/CoinConversionRule"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /coin-conversion/reset:
 *   get:
 *     summary: Reset coin conversion rule
 *     description: Sets points per coin and minimum points to 0 and disables conversion.
 *     tags:
 *       - CoinConversion
 *     responses:
 *       200:
 *         description: Coin conversion rule reset successfully
 *       500:
 *         description: Internal server error
 */
