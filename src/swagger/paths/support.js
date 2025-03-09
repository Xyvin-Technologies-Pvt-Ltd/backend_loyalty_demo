/**
 * @swagger
 * tags:
 *   - name: Support
 *     description: API for managing customer support tickets in the loyalty system
 */

/**
 * @swagger
 * /support:
 *   post:
 *     summary: Create a new support ticket
 *     description: Creates a new customer support ticket. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: string
 *                 description: ID of the customer
 *                 example: "60d21b4667d0d8992e610c85"
 *               subject:
 *                 type: string
 *                 example: "Points Not Credited"
 *               description:
 *                 type: string
 *                 example: "I made a purchase yesterday but my points were not credited to my account."
 *               category:
 *                 type: string
 *                 enum: ["Points", "Redemption", "Technical", "Account", "Other"]
 *                 example: "Points"
 *               priority:
 *                 type: string
 *                 enum: ["low", "medium", "high", "urgent"]
 *                 example: "medium"
 *               related_transaction:
 *                 type: string
 *                 description: ID of the related transaction (if applicable)
 *                 example: "60d21b4667d0d8992e610c86"
 *             required:
 *               - customer
 *               - subject
 *               - description
 *               - category
 *     responses:
 *       201:
 *         description: Support ticket created successfully
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
 *                   example: "Support ticket created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     ticket_id:
 *                       type: string
 *                       example: "TKT-001"
 *                     subject:
 *                       type: string
 *                       example: "Points Not Credited"
 *                     status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Invalid input or customer not found
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all support tickets
 *     description: Retrieves a list of all support tickets with pagination and filtering. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
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
 *           enum: ["open", "in_progress", "resolved", "closed", "reopened"]
 *         description: Filter by ticket status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ["Points", "Redemption", "Technical", "Account", "Other"]
 *         description: Filter by ticket category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: ["low", "medium", "high", "urgent"]
 *         description: Filter by ticket priority
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *         description: Filter by assigned admin ID
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer ID
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
 *         description: A list of support tickets
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
 *                   example: "Support tickets retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           ticket_id:
 *                             type: string
 *                             example: "TKT-001"
 *                           subject:
 *                             type: string
 *                             example: "Points Not Credited"
 *                           category:
 *                             type: string
 *                             example: "Points"
 *                           status:
 *                             type: string
 *                             example: "open"
 *                           priority:
 *                             type: string
 *                             example: "medium"
 *                           customer:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c85"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 50
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
 *                         pages:
 *                           type: number
 *                           example: 5
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /support/stats:
 *   get:
 *     summary: Get support ticket statistics
 *     description: Retrieves statistics about support tickets, including counts by status, category, and priority, as well as resolution time metrics. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Support ticket statistics
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
 *                   example: "Support ticket statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_tickets:
 *                       type: number
 *                       example: 150
 *                     by_status:
 *                       type: object
 *                       properties:
 *                         open:
 *                           type: number
 *                           example: 45
 *                         in_progress:
 *                           type: number
 *                           example: 30
 *                         resolved:
 *                           type: number
 *                           example: 60
 *                         closed:
 *                           type: number
 *                           example: 10
 *                         reopened:
 *                           type: number
 *                           example: 5
 *                     by_category:
 *                       type: object
 *                       properties:
 *                         Points:
 *                           type: number
 *                           example: 70
 *                         Redemption:
 *                           type: number
 *                           example: 40
 *                         Technical:
 *                           type: number
 *                           example: 25
 *                         Account:
 *                           type: number
 *                           example: 10
 *                         Other:
 *                           type: number
 *                           example: 5
 *                     by_priority:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: number
 *                           example: 30
 *                         medium:
 *                           type: number
 *                           example: 80
 *                         high:
 *                           type: number
 *                           example: 30
 *                         urgent:
 *                           type: number
 *                           example: 10
 *                     resolution_time:
 *                       type: object
 *                       properties:
 *                         average_hours:
 *                           type: number
 *                           example: 24.5
 *                         min_hours:
 *                           type: number
 *                           example: 0.5
 *                         max_hours:
 *                           type: number
 *                           example: 120.0
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /support/{id}:
 *   get:
 *     summary: Get a specific support ticket
 *     description: Retrieves a specific support ticket by ID, including all messages. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     responses:
 *       200:
 *         description: Support ticket details
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
 *                   example: "Support ticket retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     ticket_id:
 *                       type: string
 *                       example: "TKT-001"
 *                     subject:
 *                       type: string
 *                       example: "Points Not Credited"
 *                     description:
 *                       type: string
 *                       example: "I made a purchase yesterday but my points were not credited to my account."
 *                     category:
 *                       type: string
 *                       example: "Points"
 *                     status:
 *                       type: string
 *                       example: "open"
 *                     priority:
 *                       type: string
 *                       example: "medium"
 *                     customer:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c85"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                     assigned_to:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c86"
 *                         name:
 *                           type: string
 *                           example: "Admin User"
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sender_type:
 *                             type: string
 *                             example: "customer"
 *                           sender:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c85"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                           message:
 *                             type: string
 *                             example: "I made a purchase yesterday but my points were not credited to my account."
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Support ticket not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update a support ticket
 *     description: Updates an existing support ticket. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Points Not Credited - Updated"
 *               category:
 *                 type: string
 *                 enum: ["Points", "Redemption", "Technical", "Account", "Other"]
 *                 example: "Points"
 *               priority:
 *                 type: string
 *                 enum: ["low", "medium", "high", "urgent"]
 *                 example: "high"
 *               assigned_to:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Support ticket updated successfully
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
 *                   example: "Support ticket updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     ticket_id:
 *                       type: string
 *                       example: "TKT-001"
 *                     subject:
 *                       type: string
 *                       example: "Points Not Credited - Updated"
 *                     priority:
 *                       type: string
 *                       example: "high"
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Support ticket not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /support/{id}/status:
 *   patch:
 *     summary: Update a support ticket's status
 *     description: Updates the status of an existing support ticket. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["open", "in_progress", "resolved", "closed", "reopened"]
 *                 example: "resolved"
 *               resolution_notes:
 *                 type: string
 *                 example: "Points have been credited to the customer's account."
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Support ticket status updated successfully
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
 *                   example: "Support ticket status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     ticket_id:
 *                       type: string
 *                       example: "TKT-001"
 *                     status:
 *                       type: string
 *                       example: "resolved"
 *                     resolved_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Support ticket not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /support/{id}/messages:
 *   post:
 *     summary: Add a message to a support ticket
 *     description: Adds a new message to an existing support ticket. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender_type:
 *                 type: string
 *                 enum: ["customer", "admin"]
 *                 example: "admin"
 *               sender:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c86"
 *               message:
 *                 type: string
 *                 example: "We are looking into this issue and will update you shortly."
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "screenshot.png"
 *                     path:
 *                       type: string
 *                       example: "/uploads/attachments/screenshot.png"
 *                     mimetype:
 *                       type: string
 *                       example: "image/png"
 *                     size:
 *                       type: number
 *                       example: 24680
 *             required:
 *               - sender_type
 *               - sender
 *               - message
 *     responses:
 *       200:
 *         description: Message added successfully
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
 *                   example: "Message added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c90"
 *                     ticket_id:
 *                       type: string
 *                       example: "TKT-001"
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sender_type:
 *                             type: string
 *                             example: "admin"
 *                           message:
 *                             type: string
 *                             example: "We are looking into this issue and will update you shortly."
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Support ticket not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /support/customer/{customerId}:
 *   get:
 *     summary: Get support tickets for a specific customer
 *     description: Retrieves all support tickets for a specific customer with pagination and filtering. Requires MANAGE_SUPPORT permission.
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
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
 *           enum: ["open", "in_progress", "resolved", "closed", "reopened"]
 *         description: Filter by ticket status
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
 *         description: Customer support tickets
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
 *                   example: "Customer support tickets retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           ticket_id:
 *                             type: string
 *                             example: "TKT-001"
 *                           subject:
 *                             type: string
 *                             example: "Points Not Credited"
 *                           status:
 *                             type: string
 *                             example: "open"
 *                           category:
 *                             type: string
 *                             example: "Points"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 5
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 10
 *                         pages:
 *                           type: number
 *                           example: 1
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */
