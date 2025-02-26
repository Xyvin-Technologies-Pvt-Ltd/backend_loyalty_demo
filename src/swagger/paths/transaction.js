/**
 * @swagger
 * tags:
 *   - name: Transaction
 *     description: API for managing transactions
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction for the authenticated user.
 *     tags:
 *       - Transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               points:
 *                 type: number
 *                 example: 50
 *               type:
 *                 type: string
 *                 example: "purchase"
 *               merchant:
 *                 type: string
 *                 example: "Amazon"
 *               status:
 *                 type: string
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieves a list of transactions for the authenticated user.
 *     tags:
 *       - Transaction
 *     responses:
 *       200:
 *         description: Successfully fetched all transactions
 *       500:
 *         description: Internal Server Error
 */
