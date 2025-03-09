/**
 * @swagger
 * tags:
 *   - name: Tier
 *     description: Tier management endpoints
 */

/**
 * @swagger
 * /tier:
 *   post:
 *     summary: Create a new tier
 *     description: Creates a new tier with the provided details.
 *     tags:
 *       - Tier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gold"
 *               points_required:
 *                 type: number
 *                 example: 100
 *               description:
 *                 type: array
 *                 example: ["Khedmah App", "Khedmah Website"]
 *     responses:
 *       201:
 *         description: Tier created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /tier:
 *   get:
 *     summary: Get all tiers
 *     description: Retrieves a list of all tiers.
 *     tags:
 *       - Tier
 *     responses:
 *       200:
 *         description: Successfully fetched all tiers
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /tier/{id}:
 *   get:
 *     summary: Get a tier by ID
 *     description: Retrieves details of a specific tier by its ID.
 *     tags:
 *       - Tier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tier to retrieve
 *     responses:
 *       200:
 *         description: Successfully fetched the tier
 *       404:
 *         description: Tier not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /tier/{id}:
 *   put:
 *     summary: Update a tier
 *     description: Updates an existing tier with new details.
 *     tags:
 *       - Tier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tier to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Platinum"
 *               app:
 *                 type: string
 *                 example: "Khedmah"
 *               points_required:
 *                 type: number
 *                 example: 150
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated the tier
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Tier not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /tier/{id}:
 *   delete:
 *     summary: Delete a tier
 *     description: Deletes a tier by its ID.
 *     tags:
 *       - Tier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tier to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the tier
 *       404:
 *         description: Tier not found
 *       500:
 *         description: Internal Server Error
 */
