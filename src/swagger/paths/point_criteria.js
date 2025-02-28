/**
 * @swagger
 * tags:
 *   - name: PointCriteria
 *     description: API for managing point criteria
 */

/**
 * @swagger
 * /point-criteria:
 *   post:
 *     summary: Create a new point criteria
 *     description: Adds a new point criteria to the system.
 *     tags:
 *       - PointCriteria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Referral Bonus"
 *               description:
 *                 type: string
 *                 example: "Points awarded for referring new users"
 *               type:
 *                 type: string
 *                 example: "Referral"
 *               app:
 *                 type: string
 *                 example: "Khedmah"
 *               point:
 *                 type: number
 *                 example: 50
 *               amount:
 *                 type: number
 *                 example: 100
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Criteria created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /point-criteria:
 *   get:
 *     summary: Get all point criteria
 *     description: Retrieves a list of all point criteria.
 *     tags:
 *       - PointCriteria
 *     responses:
 *       200:
 *         description: Successfully fetched all criteria
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /point-criteria/{id}:
 *   get:
 *     summary: Get point criteria by ID
 *     description: Retrieves details of a specific point criteria by its ID.
 *     tags:
 *       - PointCriteria
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the criteria to retrieve
 *     responses:
 *       200:
 *         description: Successfully fetched the criteria
 *       404:
 *         description: Criteria not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /point-criteria/{id}:
 *   put:
 *     summary: Update point criteria
 *     description: Updates an existing point criteria with new details.
 *     tags:
 *       - PointCriteria
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the criteria to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Loyalty Bonus"
 *               description:
 *                 type: string
 *                 example: "Points for long-term users"
 *               type:
 *                 type: string
 *                 example: "Loyalty"
 *               app:
 *                 type: string
 *                 example: "Khedmah"
 *               point:
 *                 type: number
 *                 example: 75
 *               amount:
 *                 type: number
 *                 example: 150
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Successfully updated the criteria
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Criteria not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /point-criteria/{id}:
 *   delete:
 *     summary: Delete point criteria
 *     description: Deletes a point criteria by its ID.
 *     tags:
 *       - PointCriteria
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the criteria to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the criteria
 *       404:
 *         description: Criteria not found
 *       500:
 *         description: Internal Server Error
 */
