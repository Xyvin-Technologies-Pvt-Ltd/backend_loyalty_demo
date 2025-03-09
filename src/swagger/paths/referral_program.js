/**
 * @swagger
 * tags:
 *   - name: Referral Program
 *     description: API for managing referral programs in the loyalty system
 */

/**
 * @swagger
 * /referral-program/entries:
 *   post:
 *     summary: Create a new referral entry
 *     description: Creates a new referral program entry. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referrer_id:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c91"
 *                 description: ID of the customer who referred
 *               referee_id:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c92"
 *                 description: ID of the customer who was referred
 *               referral_code:
 *                 type: string
 *                 example: "FRIEND25"
 *                 description: Referral code used
 *               status:
 *                 type: string
 *                 enum: ["pending", "completed", "rejected"]
 *                 example: "pending"
 *                 description: Status of the referral
 *               notes:
 *                 type: string
 *                 example: "Referred through mobile app"
 *             required:
 *               - referrer_id
 *               - referee_id
 *               - referral_code
 *     responses:
 *       201:
 *         description: Referral entry created successfully
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
 *                   example: "Referral entry created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c93"
 *                     referrer:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c91"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                     referee:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c92"
 *                         name:
 *                           type: string
 *                           example: "Jane Smith"
 *                     referral_code:
 *                       type: string
 *                       example: "FRIEND25"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all referral entries
 *     description: Retrieves a list of all referral program entries with pagination and filtering. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *           enum: ["pending", "completed", "rejected"]
 *         description: Filter by status
 *       - in: query
 *         name: referrer_id
 *         schema:
 *           type: string
 *         description: Filter by referrer ID
 *       - in: query
 *         name: referee_id
 *         schema:
 *           type: string
 *         description: Filter by referee ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries from this date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries until this date (YYYY-MM-DD)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of referral entries
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
 *                   example: "Referral entries retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     entries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c93"
 *                           referrer:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c91"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john@example.com"
 *                           referee:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c92"
 *                               name:
 *                                 type: string
 *                                 example: "Jane Smith"
 *                               email:
 *                                 type: string
 *                                 example: "jane@example.com"
 *                           referral_code:
 *                             type: string
 *                             example: "FRIEND25"
 *                           status:
 *                             type: string
 *                             example: "pending"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total_referrals:
 *                           type: number
 *                           example: 150
 *                         completed:
 *                           type: number
 *                           example: 120
 *                         pending:
 *                           type: number
 *                           example: 25
 *                         rejected:
 *                           type: number
 *                           example: 5
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 150
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
 *                         pages:
 *                           type: number
 *                           example: 15
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /referral-program/entries/{id}:
 *   get:
 *     summary: Get a specific referral entry
 *     description: Retrieves details of a specific referral entry. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral entry ID
 *     responses:
 *       200:
 *         description: Referral entry details
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
 *                   example: "Referral entry retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c93"
 *                     referrer:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c91"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                     referee:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c92"
 *                         name:
 *                           type: string
 *                           example: "Jane Smith"
 *                         email:
 *                           type: string
 *                           example: "jane@example.com"
 *                         phone:
 *                           type: string
 *                           example: "+1987654321"
 *                     referral_code:
 *                       type: string
 *                       example: "FRIEND25"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     notes:
 *                       type: string
 *                       example: "Referred through mobile app"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Referral entry not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update a referral entry
 *     description: Updates an existing referral entry. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["pending", "completed", "rejected"]
 *                 example: "completed"
 *               notes:
 *                 type: string
 *                 example: "Referral completed, points awarded"
 *     responses:
 *       200:
 *         description: Referral entry updated successfully
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
 *                   example: "Referral entry updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c93"
 *                     status:
 *                       type: string
 *                       example: "completed"
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
 *         description: Referral entry not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete a referral entry
 *     description: Deletes a referral entry. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The referral entry ID
 *     responses:
 *       200:
 *         description: Referral entry deleted successfully
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
 *                   example: "Referral entry deleted successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Referral entry not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /referral-program/customer/{id}/referrals:
 *   get:
 *     summary: Get customer referrals
 *     description: Retrieves all referrals made by a specific customer. Requires MANAGE_REFERRALS permission.
 *     tags:
 *       - Referral Program
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["pending", "completed", "rejected"]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Customer referrals
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
 *                   example: "Customer referrals retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c91"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         referral_code:
 *                           type: string
 *                           example: "JOHN25"
 *                     referrals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c93"
 *                           referee:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c92"
 *                               name:
 *                                 type: string
 *                                 example: "Jane Smith"
 *                               email:
 *                                 type: string
 *                                 example: "jane@example.com"
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 15
 *                         completed:
 *                           type: number
 *                           example: 12
 *                         pending:
 *                           type: number
 *                           example: 2
 *                         rejected:
 *                           type: number
 *                           example: 1
 *                         points_earned:
 *                           type: number
 *                           example: 600
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal Server Error
 */
