const SDKAccessKey = require("../../../models/sdk_access_key_model");
const response_handler = require("../../../helpers/response_handler");
const { logger } = require("../../../middlewares/logger");

// Get the current SDK access key
exports.getSDKKey = async (req, res) => {
    try {
        const accessKey = await SDKAccessKey.findOne();
        if (!accessKey) {
            return response_handler(res, 404, "No SDK key found.");
        }
        return response_handler(res, 200, "SDK key retrieved successfully.", { key: accessKey.key });
    } catch (error) {
        logger.error(`Error fetching SDK key: ${error.message}`);
        return response_handler(res, 500, "Internal Server Error");
    }
};

// Create a new SDK access key (only if not present)
exports.createSDKKey = async (req, res) => {
    try {
        const existingKey = await SDKAccessKey.findOne();
        if (existingKey) {
            return response_handler(res, 400, "SDK key already exists. Use regenerate instead.");
        }

        const newKey = SDKAccessKey.generateKey();
        const accessKey = new SDKAccessKey({ key: newKey });

        await accessKey.save();
        logger.info("SDK access key created.");
        return response_handler(res, 201, "SDK key created successfully.", { key: newKey });
    } catch (error) {
        logger.error(`Error creating SDK key: ${error.message}`);
        return response_handler(res, 500, "Internal Server Error");
    }
};

// Regenerate a new SDK access key (replace existing)
exports.regenerateSDKKey = async (req, res) => {
    try {
        const accessKey = await SDKAccessKey.findOne();
        if (!accessKey) {
            return response_handler(res, 404, "No SDK key found. Create one first.");
        }

        accessKey.key = SDKAccessKey.generateKey();
        await accessKey.save();

        logger.info("SDK access key regenerated.");
        return response_handler(res, 200, "SDK key regenerated successfully.", { key: accessKey.key });
    } catch (error) {
        logger.error(`Error regenerating SDK key: ${error.message}`);
        return response_handler(res, 500, "Internal Server Error");
    }
};

// Revoke (delete) SDK access key
exports.revokeSDKKey = async (req, res) => {
    try {
        const accessKey = await SDKAccessKey.findOne();
        if (!accessKey) {
            return response_handler(res, 404, "No SDK key found.");
        }

        await accessKey.deleteOne();
        logger.info("SDK access key revoked.");
        return response_handler(res, 200, "SDK key revoked successfully.");
    } catch (error) {
        logger.error(`Error revoking SDK key: ${error.message}`);
        return response_handler(res, 500, "Internal Server Error");
    }
};
