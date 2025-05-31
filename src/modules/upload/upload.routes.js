const express = require("express");
const router = express.Router();
// const { authorizePermission } = require("../../middlewares/auth/auth");
// const multer = require("multer");
// const { uploadImage, updateImage, deleteImage } = require("./upload.controller");

// Use memory storage
// const upload = multer({ storage: multer.memoryStorage() });

const {
  uploadSinglePhoto,
  uploadMultiplePhotos,
  getUploadInfo,
} = require("./upload-local.controller");

// router.use(authorizePermission("UPLOAD_IMAGES"));

// Single photo upload
router.post("/single", uploadSinglePhoto);

// Multiple photos upload
router.post("/multiple", uploadMultiplePhotos);

// Get upload directory information
router.get("/info", getUploadInfo);

// // Upload image
// router.post("/image",
//   upload.single("image"),
//   uploadImage
// );

// // Update image
// router.put("/image",
//     upload.single("image"),
//     updateImage
// );

// // Delete image
// router.delete("/image",
//     deleteImage
// );

module.exports = router;
