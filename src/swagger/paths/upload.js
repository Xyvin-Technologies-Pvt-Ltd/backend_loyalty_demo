/**
 * @swagger
 * tags:
 *   - name: Image Upload
 *     description: Image upload and management endpoints
 */

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload new image to S3
 *     description: Uploads a new image file to AWS S3 bucket and returns the URL.
 *     tags:
 *       - Image Upload
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF, WEBP)
 *                 example: "image.jpg"
 *     responses:
 *       201:
 *         description: Image uploaded successfully
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
 *                   example: "Image uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://your-bucket.s3.amazonaws.com/image.jpg"
 *       400:
 *         description: No image file provided or invalid file type
 *       500:
 *         description: Error uploading image
 */

/**
 * @swagger
 * /upload/image:
 *   put:
 *     summary: Update existing image in S3
 *     description: Updates an existing image by deleting the old one and uploading a new one.
 *     tags:
 *       - Image Upload
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file to upload
 *                 example: "new-image.jpg"
 *               oldImageUrl:
 *                 type: string
 *                 description: URL of the image to be replaced
 *                 example: "https://your-bucket.s3.amazonaws.com/old-image.jpg"
 *     responses:
 *       200:
 *         description: Image updated successfully
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
 *                   example: "Image updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://your-bucket.s3.amazonaws.com/new-image.jpg"
 *       400:
 *         description: No image file provided or invalid file type
 *       500:
 *         description: Error updating image
 */

/**
 * @swagger
 * /upload/image:
 *   delete:
 *     summary: Delete image from S3
 *     description: Deletes an image from the AWS S3 bucket.
 *     tags:
 *       - Image Upload
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to delete
 *                 example: "https://your-bucket.s3.amazonaws.com/image.jpg"
 *     responses:
 *       200:
 *         description: Image deleted successfully
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
 *                   example: "Image deleted successfully"
 *       400:
 *         description: No image URL provided
 *       500:
 *         description: Error deleting image
 */ 