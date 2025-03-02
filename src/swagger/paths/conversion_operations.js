/**
 * @swagger
 * /conversion/calculate:
 *   post:
 *     summary: Calculate conversion
 *     description: Calculate how many coins would be received for a given number of points
 *     tags: [Conversion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *             properties:
 *               points:
 *                 type: number
 *                 description: Number of points to convert
 *                 example: 5000
 *               ruleId:
 *                 type: string
 *                 description: ID of the conversion rule to use (optional)
 *     responses:
 *       200:
 *         description: Conversion calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversion calculated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     points:
 *                       type: number
 *                       example: 5000
 *                     baseCoins:
 *                       type: number
 *                       example: 500
 *                     bonusCoins:
 *                       type: number
 *                       example: 50
 *                     totalCoins:
 *                       type: number
 *                       example: 550
 *                     conversionRate:
 *                       type: string
 *                       example: "1:10"
 *                     rule:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "Standard Conversion"
 *                         conversionRate:
 *                           type: number
 *                           example: 10
 *                         bonusPercentage:
 *                           type: number
 *                           example: 10
 *       400:
 *         description: Invalid input data or insufficient points
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversion rule not found or no active rules
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /conversion/convert:
 *   post:
 *     summary: Convert points to coins
 *     description: Convert a user's points to coins
 *     tags: [Conversion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *             properties:
 *               points:
 *                 type: number
 *                 description: Number of points to convert
 *                 example: 5000
 *               ruleId:
 *                 type: string
 *                 description: ID of the conversion rule to use (optional)
 *     responses:
 *       200:
 *         description: Points converted to coins successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Points converted to coins successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversionId:
 *                       type: string
 *                       description: ID of the conversion record
 *                     points:
 *                       type: number
 *                       example: 5000
 *                     baseCoins:
 *                       type: number
 *                       example: 500
 *                     bonusCoins:
 *                       type: number
 *                       example: 50
 *                     totalCoins:
 *                       type: number
 *                       example: 550
 *                     conversionRate:
 *                       type: string
 *                       example: "1:10"
 *                     transactionId:
 *                       type: string
 *                       example: "CONV-1646123456789-123"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     updatedPoints:
 *                       type: number
 *                       example: 2000
 *                     updatedCoins:
 *                       type: number
 *                       example: 750
 *       400:
 *         description: Invalid input data or insufficient points
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found, conversion rule not found, or no active rules
 *       500:
 *         description: Internal server error
 */ 