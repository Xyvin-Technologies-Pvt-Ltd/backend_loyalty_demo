const response_handler = require("../../helpers/response_handler");
const { uploadToS3, deleteFromS3 } = require("../../helpers/s3bucket");
const fs = require("fs");
const path = require("path");

// Upload new image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return response_handler(res, 400, "No image file provided");
    }

    // Optionally: upload to S3
    // const fileUrl = await uploadToS3(req.file);

    return response_handler(res, 201, "Image uploaded successfully", {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
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
          // Extract the filename from the URL or path
          const oldImageFilename = path.basename(oldImageUrl);
          const oldImagePath = path.join(__dirname, "../../uploads", oldImageFilename);
  
          // Check if file exists and delete
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error("Error deleting old image:", error);
          // Proceed without throwing error to allow upload of new image
        }
      }
  
      // The new file is already stored by multer in req.file.path
      return response_handler(res, 200, "Image updated successfully", {
        url: `/uploads/${req.file.filename}`,
      });
    } catch (error) {
      console.error("Error updating image:", error);
      return response_handler(res, 500, "Error updating image");
    }
  };

// Delete image

const deleteImage = async (req, res) => {
    try {
      // Use req.query or req.body
      const { imageUrl } = req.body; 
  
      if (!imageUrl) {
        return response_handler(res, 400, "No image URL provided");
      }
  
      const filename = path.basename(imageUrl);
      const filePath = path.join(__dirname, "../../uploads", filename);
  
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        return response_handler(res, 404, "Image not found");
      }
  
      return response_handler(res, 200, "Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      return response_handler(res, 500, "Error deleting image");
    }
  };
  

module.exports = {
  uploadImage,
  updateImage,
  deleteImage,
};
