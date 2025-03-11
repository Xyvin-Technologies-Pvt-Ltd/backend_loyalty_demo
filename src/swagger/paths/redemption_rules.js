/**
 * @swagger
 * /redemption-rules:
 *   get:
 *     summary: Get active redemption rules
 *     tags: [Redemption Rules]
 *     responses:
 *       200:
 *         description: Successfully retrieved redemption rules
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
 *                   example: "Redemption rules retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     minimum_points_required:
 *                       type: number
 *                       example: 100
 *                     maximum_points_per_day:
 *                       type: number
 *                       example: 1000
 *                     tier_multipliers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tier_id:
 *                             type: string
 *                             description: ID of the tier
 *                             example: "67cc562cf71f32d55006efab"
 *                           multiplier:
 *                             type: number
 *                             description: Multiplier for the tier
 *                             example: 1.5
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     updated_by:
 *                       type: string
 *                       description: ID of the admin who updated the rules
 *                       example: "67cc56e2f71f32d55006efde"
 *
 *   post:
 *     summary: Create or update redemption rules
 *     tags: [Redemption Rules]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minimum_points_required:
 *                 type: number
 *                 description: Minimum points required to redeem
 *                 example: 100
 *               maximum_points_per_day:
 *                 type: number
 *                 description: Maximum points redeemable per day
 *                 example: 1000
 *               tier_multipliers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tier_id:
 *                       type: string
 *                       description: ID of the tier
 *                       example: "67cc562cf71f32d55006efab"
 *                     multiplier:
 *                       type: number
 *                       description: Multiplier for the tier
 *                       example: 1.5
 *     responses:
 *       200:
 *         description: Successfully updated redemption rules
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
 *                   example: "Redemption rules updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RedemptionRules'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
