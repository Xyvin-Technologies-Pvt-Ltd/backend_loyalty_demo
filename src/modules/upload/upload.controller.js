const AWS = require('aws-sdk');
const response_handler = require('../../helpers/response_handler');

// Configure AWS
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Upload new image
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return response_handler(res, 400, 'No image file provided');
        }

        const imageUrl = req.file.location;
        return response_handler(res, 201, 'Image uploaded successfully', {
            url: imageUrl
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return response_handler(res, 500, 'Error uploading image');
    }
};

// Update image (delete old and upload new)
const updateImage = async (req, res) => {
    try {
        if (!req.file) {
            return response_handler(res, 400, 'No image file provided');
        }

        const oldImageUrl = req.body.oldImageUrl;

        // Delete old image if URL is provided
        if (oldImageUrl) {
            try {
                // Extract key from URL
                const key = oldImageUrl.split('/').pop();
                await s3.deleteObject({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key
                }).promise();
            } catch (error) {
                console.error('Error deleting old image:', error);
                // Continue with upload even if delete fails
            }
        }

        const newImageUrl = req.file.location;
        return response_handler(res, 200, 'Image updated successfully', {
            url: newImageUrl
        });
    } catch (error) {
        console.error('Error updating image:', error);
        return response_handler(res, 500, 'Error updating image');
    }
};

// Delete image
const deleteImage = async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return response_handler(res, 400, 'No image URL provided');
        }

        // Extract key from URL
        const key = imageUrl.split('/').pop();

        await s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        }).promise();

        return response_handler(res, 200, 'Image deleted successfully');
    } catch (error) {
        console.error('Error deleting image:', error);
        return response_handler(res, 500, 'Error deleting image');
    }
};

module.exports = {
    uploadImage,
    updateImage,
    deleteImage
}; 