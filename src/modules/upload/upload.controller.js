const response_handler = require("../../helpers/response_handler");
const { uploadToS3, deleteFromS3 } = require("../../helpers/s3bucket");

// Upload new image
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return response_handler(res, 400, "No image file provided");
        }

        const fileUrl = await uploadToS3(req.file);
        return response_handler(res, 201, "Image uploaded successfully", { url: fileUrl });
    } catch (error) {
        console.error("Error uploading image:", error);
        return response_handler(res, 500, "Error uploading image");
    }
};

// Update image (delete old and upload new)
const updateImage = async (req, res) => {
    try {
        if (!req.file) {
            return response_handler(res, 400, "No image file provided");
        }

        const oldImageUrl = req.body.oldImageUrl;

        if (oldImageUrl) {
            try {
                await deleteFromS3(oldImageUrl);
            } catch (error) {
                console.error("Error deleting old image:", error);
            }
        }

        const fileUrl = await uploadToS3(req.file);
        return response_handler(res, 200, "Image updated successfully", { url: fileUrl });
    } catch (error) {
        console.error("Error updating image:", error);
        return response_handler(res, 500, "Error updating image");
    }
};

// Delete image
const deleteImage = async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return response_handler(res, 400, "No image URL provided");
        }

        await deleteFromS3(imageUrl);
        return response_handler(res, 200, "Image deleted successfully");
    } catch (error) {
        console.error("Error deleting image:", error);
        return response_handler(res, 500, "Error deleting image");
    }
};

module.exports = {
    uploadImage,
    updateImage,
    deleteImage
};
