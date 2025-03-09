/**
 * @swagger
 * tags:
 *   - name: Referral Program Rules
 *     description: API for managing referral program rules in the loyalty system
 */

/**
 * @swagger
 * /referral-program/rules:
 *   post:
 *     summary: Create a new referral program rule
 *     description: Creates a new referral program rule. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program Rules
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Standard Referral Program"
 *               description:
 *                 type: string
 *                 example: "Standard referral program with points for both referrer and referee"
 *               referrer_points:
 *                 type: number
 *                 example: 50
 *                 description: Points awarded to the referrer
 *               referee_points:
 *                 type: number
 *                 example: 25
 *                 description: Points awarded to the referee
 *               max_referrals_per_customer:
 *                 type: number
 *                 example: 10
 *                 description: Maximum number of referrals allowed per customer
 *               completion_criteria:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: ["registration", "first_purchase", "minimum_spend"]
 *                     example: "first_purchase"
 *                     description: Type of criteria for referral completion
 *                   minimum_spend:
 *                     type: number
 *                     example: 100
 *                     description: Minimum spend amount (only for minimum_spend type)
 *               expiry_days:
 *                 type: number
 *                 example: 30
 *                 description: Number of days until referral expires
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive", "draft"]
 *                 example: "active"
 *                 description: Status of the referral program rule
 *             required:
 *               - name
 *               - referrer_points
 *               - referee_points
 *               - completion_criteria
 *               - status
 *     responses:
 *       201:
 *         description: Referral program rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Referral program rule created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c95"
 *                     name:
 *                       type: string
 *                       example: "Standard Referral Program"
 *                     referrer_points:
 *                       type: number
 *                       example: 50
 *                     referee_points:
 *                       type: number
 *                       example: 25
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all referral program rules
 *     description: Retrieves a list of all referral program rules. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program Rules
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["active", "inactive", "draft"]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: A list of referral program rules
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
 *                   example: "Referral program rules retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c95"
 *                       name:
 *                         type: string
 *                         example: "Standard Referral Program"
 *                       description:
 *                         type: string
 *                         example: "Standard referral program with points for both referrer and referee"
 *                       referrer_points:
 *                         type: number
 *                         example: 50
 *                       referee_points:
 *                         type: number
 *                         example: 25
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /referral-program/rules/{id}:
 *   get:
 *     summary: Get a specific referral program rule
 *     description: Retrieves details of a specific referral program rule. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program Rules
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral program rule ID
 *     responses:
 *       200:
 *         description: Referral program rule details
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
 *                   example: "Referral program rule retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c95"
 *                     name:
 *                       type: string
 *                       example: "Standard Referral Program"
 *                     description:
 *                       type: string
 *                       example: "Standard referral program with points for both referrer and referee"
 *                     referrer_points:
 *                       type: number
 *                       example: 50
 *                     referee_points:
 *                       type: number
 *                       example: 25
 *                     max_referrals_per_customer:
 *                       type: number
 *                       example: 10
 *                     completion_criteria:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "first_purchase"
 *                         minimum_spend:
 *                           type: number
 *                           example: 100
 *                     expiry_days:
 *                       type: number
 *                       example: 30
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total_referrals:
 *                           type: number
 *                           example: 150
 *                         completed_referrals:
 *                           type: number
 *                           example: 120
 *                         points_awarded:
 *                           type: number
 *                           example: 9000
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Referral program rule not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update a referral program rule
 *     description: Updates an existing referral program rule. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program Rules
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral program rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Referral Program"
 *               description:
 *                 type: string
 *                 example: "Updated referral program with increased points"
 *               referrer_points:
 *                 type: number
 *                 example: 75
 *               referee_points:
 *                 type: number
 *                 example: 50
 *               max_referrals_per_customer:
 *                 type: number
 *                 example: 15
 *               completion_criteria:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: ["registration", "first_purchase", "minimum_spend"]
 *                     example: "minimum_spend"
 *                   minimum_spend:
 *                     type: number
 *                     example: 150
 *               expiry_days:
 *                 type: number
 *                 example: 45
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive", "draft"]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Referral program rule updated successfully
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
 *                   example: "Referral program rule updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c95"
 *                     name:
 *                       type: string
 *                       example: "Updated Referral Program"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Referral program rule not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete a referral program rule
 *     description: Deletes a referral program rule. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program Rules
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral program rule ID
 *     responses:
 *       200:
 *         description: Referral program rule deleted successfully
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
 *                   example: "Referral program rule deleted successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Referral program rule not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /referral-program/rules/{id}/activate:
 *   patch:
 *     summary: Activate a referral program rule
 *     description: Activates a referral program rule. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program Rules
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral program rule ID
 *     responses:
 *       200:
 *         description: Referral program rule activated successfully
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
 *                   example: "Referral program rule activated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c95"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Referral program rule not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /referral-program/rules/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a referral program rule
 *     description: Deactivates a referral program rule. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program Rules
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral program rule ID
 *     responses:
 *       200:
 *         description: Referral program rule deactivated successfully
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
 *                   example: "Referral program rule deactivated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c95"
 *                     status:
 *                       type: string
 *                       example: "inactive"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Referral program rule not found
 *       500:
 *         description: Internal Server Error
 */
