/**
 * @swagger
 * tags:
 *   - name: TriggerEvents
 *     description: API for managing event triggers for point criteria
 */

/**
 * @swagger
 * /trigger-events:
 *   post:
 *     summary: Create a new event trigger
 *     description: Adds a new event trigger to the system.
 *     tags:
 *       - TriggerEvents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slNo:
 *                 type: number
 *                 example: 21
 *               eventName:
 *                 type: string
 *                 example: "New Registration"
 *               eventAttributes:
 *                 type: string
 *                 example: "User registration via mobile app"
 *               khedmahRequired:
 *                 type: boolean
 *                 example: true
 *               conditions:
 *                 type: string
 *                 example: "First time registration only"
 *               khedmahPayRequired:
 *                 type: boolean
 *                 example: false
 *               pointsKhedmah:
 *                 type: number
 *                 example: 100
 *               pointsKhedmahPay:
 *                 type: number
 *                 example: 0
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Event trigger created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all event triggers
 *     description: Retrieves a list of all event triggers.
 *     tags:
 *       - TriggerEvents
 *     responses:
 *       200:
 *         description: A list of event triggers
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
 *                   example: "Event triggers fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       slNo:
 *                         type: number
 *                         example: 21
 *                       eventName:
 *                         type: string
 *                         example: "New Registration"
 *                       eventAttributes:
 *                         type: string
 *                         example: "User registration via mobile app"
 *                       khedmahRequired:
 *                         type: boolean
 *                         example: true
 *                       conditions:
 *                         type: string
 *                         example: "First time registration only"
 *                       khedmahPayRequired:
 *                         type: boolean
 *                         example: false
 *                       pointsKhedmah:
 *                         type: number
 *                         example: 100
 *                       pointsKhedmahPay:
 *                         type: number
 *                         example: 0
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-03-01T12:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-03-01T12:00:00.000Z"
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /trigger-events/{id}:
 *   get:
 *     summary: Get a specific event trigger
 *     description: Retrieves a specific event trigger by ID.
 *     tags:
 *       - TriggerEvents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event trigger ID
 *     responses:
 *       200:
 *         description: Event trigger details
 *       404:
 *         description: Event trigger not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update an event trigger
 *     description: Updates an existing event trigger.
 *     tags:
 *       - TriggerEvents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event trigger ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slNo:
 *                 type: number
 *                 example: 21
 *               eventName:
 *                 type: string
 *                 example: "New Registration"
 *               eventAttributes:
 *                 type: string
 *                 example: "User registration via mobile app"
 *               khedmahRequired:
 *                 type: boolean
 *                 example: true
 *               conditions:
 *                 type: string
 *                 example: "First time registration only"
 *               khedmahPayRequired:
 *                 type: boolean
 *                 example: false
 *               pointsKhedmah:
 *                 type: number
 *                 example: 100
 *               pointsKhedmahPay:
 *                 type: number
 *                 example: 0
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Event trigger updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Event trigger not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete an event trigger
 *     description: Deletes an event trigger from the system.
 *     tags:
 *       - TriggerEvents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event trigger ID
 *     responses:
 *       200:
 *         description: Event trigger deleted successfully
 *       404:
 *         description: Event trigger not found
 *       500:
 *         description: Internal Server Error
 */
