const SDKAccessKey = require("../../../models/sdk_access_key_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");

/**
 * Generate a new SDK access key
 */
exports.generateKey = async (req, res) => {
    try {
        // Validate request body
        if (!req.body.name || !req.body.client || !req.body.client.name || !req.body.client.email || !req.body.client.company) {
            return response_handler(res, 400, "Missing required fields. Please provide name and client information.");
        }

        // Generate a new key
        const key = SDKAccessKey.generateKey();

        // Create a new SDK access key
        const newAccessKey = new SDKAccessKey({
            name: req.body.name,
            description: req.body.description,
            client: {
                name: req.body.client.name,
                email: req.body.client.email,
                company: req.body.client.company,
                website: req.body.client.website
            },
            key: key,
            permissions: req.body.permissions || {
                user_data: true,
                transactions: true,
                points: true,
                redemptions: true
            },
            rate_limit: req.body.rate_limit || {
                requests_per_minute: 60,
                requests_per_day: 10000
            },
            environment: req.body.environment || 'development',
            created_by: req.admin ? req.admin._id : null
        });

        await newAccessKey.save();

        logger.info(`New SDK access key generated for ${req.body.client.name} by ${req.admin ? req.admin.name : 'unknown'}`);

        // Return the new key (this is the only time the full key will be shown)
        return response_handler(res, 201, "SDK access key generated successfully", {
            _id: newAccessKey._id,
            name: newAccessKey.name,
            key: newAccessKey.key,
            client: newAccessKey.client,
            permissions: newAccessKey.permissions,
            environment: newAccessKey.environment,
            created_at: newAccessKey.createdAt
        });
    } catch (error) {
        logger.error(`Error generating SDK access key: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get all SDK access keys
 */
exports.getAllKeys = async (req, res) => {
    try {
        // Get all keys but don't return the actual key value for security
        const keys = await SDKAccessKey.find({}, { key: 0 }).sort({ createdAt: -1 });

        return response_handler(res, 200, "SDK access keys retrieved successfully", keys);
    } catch (error) {
        logger.error(`Error retrieving SDK access keys: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Get a single SDK access key by ID
 */
exports.getKeyById = async (req, res) => {
    try {
        const key = await SDKAccessKey.findById(req.params.id, { key: 0 });

        if (!key) {
            return response_handler(res, 404, "SDK access key not found");
        }

        return response_handler(res, 200, "SDK access key retrieved successfully", key);
    } catch (error) {
        logger.error(`Error retrieving SDK access key: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Update an SDK access key
 */
exports.updateKey = async (req, res) => {
    try {
        // Don't allow updating the key itself
        if (req.body.key) {
            delete req.body.key;
        }

        const updatedKey = await SDKAccessKey.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true, fields: { key: 0 } }
        );

        if (!updatedKey) {
            return response_handler(res, 404, "SDK access key not found");
        }

        logger.info(`SDK access key ${updatedKey.name} updated by ${req.admin ? req.admin.name : 'unknown'}`);

        return response_handler(res, 200, "SDK access key updated successfully", updatedKey);
    } catch (error) {
        logger.error(`Error updating SDK access key: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Revoke an SDK access key
 */
exports.revokeKey = async (req, res) => {
    try {
        const key = await SDKAccessKey.findByIdAndUpdate(
            req.params.id,
            { $set: { status: 'revoked' } },
            { new: true, fields: { key: 0 } }
        );

        if (!key) {
            return response_handler(res, 404, "SDK access key not found");
        }

        logger.info(`SDK access key ${key.name} revoked by ${req.admin ? req.admin.name : 'unknown'}`);

        return response_handler(res, 200, "SDK access key revoked successfully", key);
    } catch (error) {
        logger.error(`Error revoking SDK access key: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

/**
 * Regenerate an SDK access key
 */
exports.regenerateKey = async (req, res) => {
    try {
        // Generate a new key
        const newKey = SDKAccessKey.generateKey();

        const key = await SDKAccessKey.findByIdAndUpdate(
            req.params.id,
            { $set: { key: newKey } },
            { new: true }
        );

        if (!key) {
            return response_handler(res, 404, "SDK access key not found");
        }

        logger.info(`SDK access key ${key.name} regenerated by ${req.admin ? req.admin.name : 'unknown'}`);

        // Return the new key (this is the only time the full key will be shown)
        return response_handler(res, 200, "SDK access key regenerated successfully", {
            _id: key._id,
            name: key.name,
            key: key.key,
            client: key.client,
            environment: key.environment
        });
    } catch (error) {
        logger.error(`Error regenerating SDK access key: ${error.message}`, { stack: error.stack });
        return response_handler(res, 500, `Internal Server Error: ${error.message}`);
    }
}; 