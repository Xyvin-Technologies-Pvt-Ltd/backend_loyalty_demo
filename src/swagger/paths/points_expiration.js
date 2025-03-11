/**
 * @swagger
 * tags:
 *   name: PointsExpiration
 *   description: Points expiration rules management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PointsExpirationRules:
 *       type: object
 *       properties:
 *         default_expiry_period:
 *           type: number
 *           description: Default expiry period in months
 *           example: 12
 *         tier_extensions:
 *           type: array
 *           description: Tier-based expiry extensions
 *           items:
 *             type: object
 *             properties:
 *               tier_id:
 *                 type: string
 *                 description: ID of the tier
 *                 example: "67cc562cf71f32d55006efab"
 *               additional_months:
 *                 type: number
 *                 description: Additional months granted for this tier
 *           example: 
 *             - tier_id: "67cc562cf71f32d55006efab"
 *               additional_months: 1   
 *             - tier_id: "67cc562cf71f32d55006efac"
 *               additional_months: 2
 *             - tier_id: "67cc562cf71f32d55006efad"
 *               additional_months: 3
 *         expiry_notifications:
 *           type: object
 *           properties:
 *             first_reminder:
 *               type: number
 *               description: Days before expiry for the first reminder
 *               example: 30
 *             second_reminder:
 *               type: number
 *               description: Days before expiry for the second reminder
 *               example: 15
 *             final_reminder:
 *               type: number
 *               description: Days before expiry for the final reminder
 *               example: 7
 *         grace_period:
 *           type: number
 *           description: Additional grace period in days after expiry
 *           example: 30
 */

/**
 * @swagger
 * /point-expiry-rules:
 *   get:
 *     summary: Get current points expiration rules
 *     tags: [PointsExpiration]
 *     description: Retrieves the currently active points expiration rules.
 *     responses:
 *       200:
 *         description: Successfully retrieved expiration rules
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PointsExpirationRules'
 *       404:
 *         description: No active expiration rules found
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create or update points expiration rules
 *     tags: [PointsExpiration]
 *     description: Allows an admin to create or update the points expiration rules.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointsExpirationRules'
 *     responses:
 *       200:
 *         description: Successfully updated expiration rules
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized action
 *       500:
 *         description: Internal server error
 */
