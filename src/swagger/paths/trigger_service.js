/**
 * @swagger
 * tags:
 *   - name: ServiceProviders
 *     description: API for managing service providers for point criteria
 */

/**
 * @swagger
 * /service-providers:
 *   post:
 *     summary: Create a new service provider
 *     description: Adds a new service provider to the system.
 *     tags:
 *       - ServiceProviders
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
 *     summary: Get all service providers
 *     description: Retrieves a list of all service providers.
 *     tags:
 *       - ServiceProviders
 *     responses:
 *       200:
 *         description: A list of service providers
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
 * /service-providers/category/{category}:
 *   get:
 *     summary: Get service providers by category
 *     description: Retrieves a list of service providers filtered by category.
 *     tags:
 *       - ServiceProviders
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
 * /service-providers/{id}:
 *   get:
 *     summary: Get a specific service provider
 *     description: Retrieves a specific service provider by ID.
 *     tags:
 *       - ServiceProviders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The service provider ID
 *     responses:
 *       200:
 *         description: Service provider details
 *       404:
 *         description: Service provider not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update a service provider
 *     description: Updates an existing service provider.
 *     tags:
 *       - ServiceProviders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The service provider ID
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
 *         description: Service provider updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Service provider not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete a service provider
 *     description: Deletes a service provider from the system.
 *     tags:
 *       - ServiceProviders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The service provider ID
 *     responses:
 *       200:
 *         description: Service provider deleted successfully
 *       404:
 *         description: Service provider not found
 *       500:
 *         description: Internal Server Error
 */
