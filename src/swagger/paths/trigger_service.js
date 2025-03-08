/**
 * @swagger
 * tags:
 *   - name: TriggerServices
 *     description: API for managing trigger services for point criteria
 */

/**
 * @swagger
 * /trigger-services:
 *   post:
 *     summary: Create a new trigger service
 *     description: Adds a new trigger service to the system.
 *     tags:
 *       - TriggerServices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [
 *                   'Recharge', 
 *                   'Telecom', 
 *                   'Electricity', 
 *                   'Donations', 
 *                   'Pay Bills', 
 *                   'Water', 
 *                   'SPF', 
 *                   'Dhofar', 
 *                   'ROP', 
 *                   'Purchase',
 *                   'Khedmah Pay'
 *                 ]
 *                 example: "Telecom"
 *               providerName:
 *                 type: string
 *                 example: "Omantel"
 *               description:
 *                 type: string
 *                 example: "Oman Telecommunications Company"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Service provider created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 *
 *   get:
 *     summary: Get all trigger services
 *     description: Retrieves a list of all trigger services.
 *     tags:
 *       - TriggerServices
 *     responses:
 *       200:
 *         description: A list of trigger services
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
 *                   example: "Service providers fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       category:
 *                         type: string
 *                         example: "Telecom"
 *                       providerName:
 *                         type: string
 *                         example: "Omantel"
 *                       description:
 *                         type: string
 *                         example: "Oman Telecommunications Company"
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
 * /trigger-services/category/{category}:
 *   get:
 *     summary: Get trigger services by category
 *     description: Retrieves a list of trigger services filtered by category.
 *     tags:
 *       - TriggerServices
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [
 *             'Recharge', 
 *             'Telecom', 
 *             'Electricity', 
 *             'Donations', 
 *             'Pay Bills', 
 *             'Water', 
 *             'SPF', 
 *             'Dhofar', 
 *             'ROP', 
 *             'Purchase',
 *             'Khedmah Pay'
 *           ]
 *         description: The category to filter by
 *     responses:
 *       200:
 *         description: A list of service providers in the specified category
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /trigger-services/{id}:
 *   get:
 *     summary: Get a specific trigger service
 *     description: Retrieves a specific trigger service by ID.
 *     tags:
 *       - TriggerServices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trigger service ID
 *     responses:
 *       200:
 *         description: Trigger service details
 *       404:
 *         description: Trigger service not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update a trigger service
 *     description: Updates an existing trigger service.
 *     tags:
 *       - TriggerServices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trigger service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [
 *                   'Recharge', 
 *                   'Telecom', 
 *                   'Electricity', 
 *                   'Donations', 
 *                   'Pay Bills', 
 *                   'Water', 
 *                   'SPF', 
 *                   'Dhofar', 
 *                   'ROP', 
 *                   'Purchase',
 *                   'Khedmah Pay'
 *                 ]
 *                 example: "Telecom"
 *               providerName:
 *                 type: string
 *                 example: "Omantel"
 *               description:
 *                 type: string
 *                 example: "Oman Telecommunications Company"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Trigger service updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Trigger service not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete a trigger service
 *     description: Deletes a trigger service from the system.
 *     tags:
 *       - TriggerServices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trigger service ID
 *     responses:
 *       200:
 *         description: Trigger service deleted successfully
 *       404:
 *         description: Trigger service not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /trigger-services/event/{eventId}:
 *   get:
 *     summary: Get trigger services by event ID
 *     description: Retrieves a list of trigger services filtered by event ID.
 *     tags:
 *       - TriggerServices
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: A list of trigger services
 *       500:
 *         description: Internal Server Error
 */
