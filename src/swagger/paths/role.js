/**
 * @swagger
 * tags:
 *   - name: Role
 *     description: API for managing user roles
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role with specified permissions.
 *     tags:
 *       - Role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin"
 *               description:
 *                 type: string
 *                 example: "Administrator role with full access"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["create-user", "delete-user"]
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieves a list of all roles.
 *     tags:
 *       - Role
 *     responses:
 *       200:
 *         description: Successfully fetched all roles
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Fetch a specific role by its ID.
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65fcd75e2a73a4f9d8b5e6c3"
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role
 *     description: Updates an existing role.
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65fcd75e2a73a4f9d8b5e6c3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Moderator"
 *               description:
 *                 type: string
 *                 example: "Moderator role with limited access"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["view-users", "edit-posts"]
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     description: Deletes a role by ID.
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65fcd75e2a73a4f9d8b5e6c3"
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal Server Error
 */
