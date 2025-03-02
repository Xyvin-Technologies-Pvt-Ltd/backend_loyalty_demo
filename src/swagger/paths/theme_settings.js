/**
 * @swagger
 * tags:
 *   name: Theme Settings
 *   description: Theme settings management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ThemeSettings:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The theme settings ID
 *         primaryColor:
 *           type: string
 *           description: Primary color in hex format
 *           example: "#2B5C3F"
 *         secondaryColor:
 *           type: string
 *           description: Secondary color in hex format
 *           example: "#4CAF50"
 *         accentColor:
 *           type: string
 *           description: Accent color in hex format
 *           example: "#81C784"
 *         backgroundColor:
 *           type: string
 *           description: Background color in hex format
 *           example: "#FFFFFF"
 *         textColor:
 *           type: string
 *           description: Text color in hex format
 *           example: "#1F2937"
 *         fontFamily:
 *           type: string
 *           description: Font family for the application
 *           enum: [Inter, Roboto, Open Sans, Lato, Poppins]
 *           example: "Inter"
 *         baseFontSize:
 *           type: string
 *           description: Base font size for the application
 *           enum: [Small (14px), Medium (16px), Large (18px)]
 *           example: "Medium (16px)"
 *         borderRadius:
 *           type: string
 *           description: Border radius for UI elements
 *           enum: [None (0px), Small (4px), Medium (8px), Large (12px), Extra Large (16px)]
 *           example: "Medium (8px)"
 *         baseSpacing:
 *           type: string
 *           description: Base spacing for UI elements
 *           enum: [Compact (12px), Normal (16px), Relaxed (20px)]
 *           example: "Normal (16px)"
 *         activePreset:
 *           type: string
 *           description: Active color preset
 *           enum: [Default, Ocean, Sunset, Custom]
 *           example: "Default"
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: When the settings were last updated
 *         updatedBy:
 *           type: string
 *           description: ID of the admin who last updated the settings
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the settings were created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the settings were last updated
 */

/**
 * @swagger
 * /theme-settings:
 *   get:
 *     summary: Get theme settings
 *     description: Retrieve the current theme settings
 *     tags: [Theme Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Theme settings retrieved successfully
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
 *                   example: Theme settings retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ThemeSettings'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update theme settings
 *     description: Update the theme settings
 *     tags: [Theme Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primaryColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#2B5C3F"
 *               secondaryColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#4CAF50"
 *               accentColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#81C784"
 *               backgroundColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#FFFFFF"
 *               textColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#1F2937"
 *               fontFamily:
 *                 type: string
 *                 enum: [Inter, Roboto, Open Sans, Lato, Poppins]
 *                 example: "Inter"
 *               baseFontSize:
 *                 type: string
 *                 enum: [Small (14px), Medium (16px), Large (18px)]
 *                 example: "Medium (16px)"
 *               borderRadius:
 *                 type: string
 *                 enum: [None (0px), Small (4px), Medium (8px), Large (12px), Extra Large (16px)]
 *                 example: "Medium (8px)"
 *               baseSpacing:
 *                 type: string
 *                 enum: [Compact (12px), Normal (16px), Relaxed (20px)]
 *                 example: "Normal (16px)"
 *               activePreset:
 *                 type: string
 *                 enum: [Default, Ocean, Sunset, Custom]
 *                 example: "Custom"
 *     responses:
 *       200:
 *         description: Theme settings updated successfully
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
 *                   example: Theme settings updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ThemeSettings'
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
 * /theme-settings/reset:
 *   post:
 *     summary: Reset theme settings to defaults
 *     description: Reset all theme settings to their default values
 *     tags: [Theme Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Theme settings reset to defaults successfully
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
 *                   example: Theme settings reset to defaults successfully
 *                 data:
 *                   $ref: '#/components/schemas/ThemeSettings'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /theme-settings/preset/{presetName}:
 *   post:
 *     summary: Apply a color preset
 *     description: Apply a predefined color preset to the theme settings
 *     tags: [Theme Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: presetName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Default, Ocean, Sunset]
 *         description: Name of the preset to apply
 *     responses:
 *       200:
 *         description: Preset applied successfully
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
 *                   example: Ocean preset applied successfully
 *                 data:
 *                   $ref: '#/components/schemas/ThemeSettings'
 *       400:
 *         description: Invalid preset name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       500:
 *         description: Internal server error
 */ 