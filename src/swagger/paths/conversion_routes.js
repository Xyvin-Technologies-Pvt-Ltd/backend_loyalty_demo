/**
 * @swagger
 * /conversion/rules:
 *   get:
 *     summary: Get all conversion rules
 *     description: Retrieve all conversion rules (admin only)
 *     tags: [Conversion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversion rules retrieved successfully
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
 *                   example: Conversion rules retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConversionRule'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new conversion rule
 *     description: Create a new conversion rule (admin only)
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
 *               - name
 *               - conversionRate
 *               - minPointsRequired
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the conversion rule
 *                 example: "Premium Conversion"
 *               description:
 *                 type: string
 *                 description: Description of the conversion rule
 *                 example: "Premium conversion rate with bonus"
 *               conversionRate:
 *                 type: number
 *                 description: Number of points required for 1 coin
 *                 example: 8
 *               minPointsRequired:
 *                 type: number
 *                 description: Minimum points required to convert
 *                 example: 1000
 *               maxPointsPerConversion:
 *                 type: number
 *                 description: Maximum points allowed per conversion (0 for unlimited)
 *                 example: 0
 *               bonusPercentage:
 *                 type: number
 *                 description: Bonus percentage added to conversion
 *                 example: 10
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for this conversion rule
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date for this conversion rule (null for no end date)
 *               isActive:
 *                 type: boolean
 *                 description: Whether the rule is active
 *                 example: true
 *     responses:
 *       201:
 *         description: Conversion rule created successfully
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
 *                   example: Conversion rule created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ConversionRule'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /conversion/rules/active:
 *   get:
 *     summary: Get active conversion rules
 *     description: Retrieve all currently active conversion rules
 *     tags: [Conversion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active conversion rules retrieved successfully
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
 *                   example: Active conversion rules retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConversionRule'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /conversion/rules/{id}:
 *   get:
 *     summary: Get a conversion rule by ID
 *     description: Retrieve a specific conversion rule by its ID (admin only)
 *     tags: [Conversion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversion rule to retrieve
 *     responses:
 *       200:
 *         description: Conversion rule retrieved successfully
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
 *                   example: Conversion rule retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ConversionRule'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       404:
 *         description: Conversion rule not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a conversion rule
 *     description: Update a specific conversion rule by its ID (admin only)
 *     tags: [Conversion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversion rule to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the conversion rule
 *               description:
 *                 type: string
 *                 description: Description of the conversion rule
 *               conversionRate:
 *                 type: number
 *                 description: Number of points required for 1 coin
 *               minPointsRequired:
 *                 type: number
 *                 description: Minimum points required to convert
 *               maxPointsPerConversion:
 *                 type: number
 *                 description: Maximum points allowed per conversion (0 for unlimited)
 *               bonusPercentage:
 *                 type: number
 *                 description: Bonus percentage added to conversion
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for this conversion rule
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date for this conversion rule (null for no end date)
 *               isActive:
 *                 type: boolean
 *                 description: Whether the rule is active
 *     responses:
 *       200:
 *         description: Conversion rule updated successfully
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
 *                   example: Conversion rule updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ConversionRule'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       404:
 *         description: Conversion rule not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a conversion rule
 *     description: Delete a specific conversion rule by its ID (admin only)
 *     tags: [Conversion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversion rule to delete
 *     responses:
 *       200:
 *         description: Conversion rule deleted successfully
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
 *                   example: Conversion rule deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       404:
 *         description: Conversion rule not found
 *       500:
 *         description: Internal server error
 */ 