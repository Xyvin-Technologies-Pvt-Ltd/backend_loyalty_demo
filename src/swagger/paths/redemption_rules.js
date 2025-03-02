/**
 * @swagger
 * tags:
 *   name: Redemption Rules
 *   description: API endpoints for managing redemption rules and transactions
 */

/**
 * @swagger
 * /redemption-rules:
 *   get:
 *     summary: Get current redemption rules
 *     tags: [Redemption Rules]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Redemption rules retrieved successfully
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
 *                   example: Redemption rules retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     minimum_points_required:
 *                       type: number
 *                       example: 100
 *                     maximum_points_per_day:
 *                       type: number
 *                       example: 1000
 *                     tier_multipliers:
 *                       type: object
 *                       properties:
 *                         silver:
 *                           type: number
 *                           example: 1
 *                         gold:
 *                           type: number
 *                           example: 1.5
 *                         platinum:
 *                           type: number
 *                           example: 2
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     created_by:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     updated_by:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: No redemption rules found
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create or update redemption rules
 *     tags: [Redemption Rules]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - minimum_points_required
 *               - maximum_points_per_day
 *               - tier_multipliers
 *             properties:
 *               minimum_points_required:
 *                 type: number
 *                 example: 100
 *               maximum_points_per_day:
 *                 type: number
 *                 example: 1000
 *               tier_multipliers:
 *                 type: object
 *                 required:
 *                   - silver
 *                   - gold
 *                   - platinum
 *                 properties:
 *                   silver:
 *                     type: number
 *                     example: 1
 *                   gold:
 *                     type: number
 *                     example: 1.5
 *                   platinum:
 *                     type: number
 *                     example: 2
 *     responses:
 *       200:
 *         description: Redemption rules updated successfully
 *       201:
 *         description: Redemption rules created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /redemption-rules/validate:
 *   post:
 *     summary: Validate and process a redemption request
 *     tags: [Redemption Rules]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - points_to_redeem
 *               - reward_type
 *               - reward_details
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *               points_to_redeem:
 *                 type: number
 *                 example: 500
 *               reward_type:
 *                 type: string
 *                 example: gift_card
 *               reward_details:
 *                 type: object
 *                 example:
 *                   provider: Amazon
 *                   value: 50
 *                   currency: USD
 *     responses:
 *       200:
 *         description: Redemption successful
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
 *                   example: Redemption successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         user:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         points:
 *                           type: number
 *                           example: 500
 *                         type:
 *                           type: string
 *                           example: redemption
 *                         status:
 *                           type: string
 *                           example: pending
 *                         transaction_reference:
 *                           type: string
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         reward_type:
 *                           type: string
 *                           example: gift_card
 *                         reward_details:
 *                           type: object
 *                           example:
 *                             provider: Amazon
 *                             value: 50
 *                             currency: USD
 *                     remaining_points:
 *                       type: number
 *                       example: 1500
 *                     daily_limit_remaining:
 *                       type: number
 *                       example: 500
 *       400:
 *         description: Invalid input or redemption constraints not met
 *       404:
 *         description: User not found or redemption rules not configured
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /redemption-rules/history/{user_id}:
 *   get:
 *     summary: Get redemption history for a user
 *     tags: [Redemption Rules]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *           enum: [pending, completed, rejected, cancelled]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Redemption history retrieved successfully
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
 *                   example: Redemption history retrieved successfully
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
 *                             example: 60d21b4667d0d8992e610c85
 *                           user:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c85
 *                           points:
 *                             type: number
 *                             example: 500
 *                           type:
 *                             type: string
 *                             example: redemption
 *                           status:
 *                             type: string
 *                             example: completed
 *                           transaction_date:
 *                             type: string
 *                             format: date-time
 *                           reward_type:
 *                             type: string
 *                             example: gift_card
 *                           reward_details:
 *                             type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 25
 *                         page:
 *                           type: number
 *                           example: 1
 *                         pages:
 *                           type: number
 *                           example: 3
 *                         limit:
 *                           type: number
 *                           example: 10
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /redemption-rules/transaction/{transaction_id}/status:
 *   put:
 *     summary: Update redemption transaction status
 *     tags: [Redemption Rules]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, rejected, cancelled]
 *                 example: completed
 *               notes:
 *                 type: string
 *                 example: Transaction processed successfully
 *     responses:
 *       200:
 *         description: Redemption status updated successfully
 *       400:
 *         description: Invalid status value or not a redemption transaction
 *       404:
 *         description: Redemption transaction not found
 *       500:
 *         description: Internal server error
 */ 