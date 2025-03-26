const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Upload file to S3
const uploadToS3 = async (file) => {
    const fileStream = fs.createReadStream(file.path);
        const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${Date.now()}_${path.basename(file.originalname)}`,
        Body: fileStream,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    } catch (err) {
        console.error("S3 Upload Error:", err);
        throw err;
    }
};

// Delete file from S3
const deleteFromS3 = async (fileUrl) => {
    try {
        const key = fileUrl.split("/").slice(-2).join("/"); // Extract Key from URL

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });

        await s3.send(command);
        return true;
    } catch (err) {
        console.error("S3 Delete Error:", err);
        throw err;
    }
};

module.exports = { uploadToS3, deleteFromS3 };
