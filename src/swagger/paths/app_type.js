/**
 * @swagger
 * tags:
 *   - name: AppTypes
 *     description: API for managing application types in the loyalty system
 */

/**
 * @swagger
 * /app-types:
 *   post:
 *     summary: Create a new app type
 *     description: Creates a new application type in the system. Requires MANAGE_APP_TYPES permission.
 *     tags:
 *       - AppTypes
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
 *                 example: "Mobile App"
 *               description:
 *                 type: string
 *                 example: "Native mobile application for loyalty program"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: App type created successfully
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
 *                   example: "App type created successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "Mobile App"
 *                     description:
 *                       type: string
 *                       example: "Native mobile application for loyalty program"
 *                     isActive:
 *                       type: boolean
 *                       example: true
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
 *     summary: Get all app types
 *     description: Retrieves a list of all application types. Requires MANAGE_APP_TYPES permission.
 *     tags:
 *       - AppTypes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of app types
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
 *                   example: "App types fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       name:
 *                         type: string
 *                         example: "Mobile App"
 *                       description:
 *                         type: string
 *                         example: "Native mobile application for loyalty program"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
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
 * /app-types/{id}:
 *   get:
 *     summary: Get a specific app type
 *     description: Retrieves a specific application type by ID. Requires MANAGE_APP_TYPES permission.
 *     tags:
 *       - AppTypes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The app type ID
 *     responses:
 *       200:
 *         description: App type details
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
 *                   example: "App type fetched successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "Mobile App"
 *                     description:
 *                       type: string
 *                       example: "Native mobile application for loyalty program"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: App type not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update an app type
 *     description: Updates an existing application type. Requires MANAGE_APP_TYPES permission.
 *     tags:
 *       - AppTypes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The app type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mobile App"
 *               description:
 *                 type: string
 *                 example: "Updated description for mobile application"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: App type updated successfully
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
 *                   example: "App type updated successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: App type not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete an app type
 *     description: Deletes an application type from the system. Requires MANAGE_APP_TYPES permission.
 *     tags:
 *       - AppTypes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The app type ID
 *     responses:
 *       200:
 *         description: App type deleted successfully
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
 *                   example: "App type deleted successfully!"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: App type not found
 *       500:
 *         description: Internal Server Error
 */
