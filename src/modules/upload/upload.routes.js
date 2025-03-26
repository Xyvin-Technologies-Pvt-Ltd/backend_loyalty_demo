const express = require("express");
const router = express.Router();
const { authorizePermission } = require("../../middlewares/auth/auth");
const multer = require("multer");
const { uploadImage, updateImage, deleteImage } = require("./upload.controller");

const upload = multer({ dest: "uploads/" }); // Temporary storage


router.use(authorizePermission("UPLOAD_IMAGES"));
// Upload image
router.post("/image",
    upload.single("image"),
    uploadImage
);

// Update image
router.put("/image",
    upload.single("image"),
    updateImage
);

// Delete image
router.delete("/image",
    deleteImage
);

module.exports = router;
