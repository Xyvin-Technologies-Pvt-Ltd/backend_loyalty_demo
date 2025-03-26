const express = require('express');
const router = express.Router();
const { authorizePermission } = require('../../middlewares/auth/auth');
const upload = require('../../helpers/s3bucket');
const { uploadImage, updateImage, deleteImage } = require('./upload.controller');

// Single file upload route
router.post('/image',
    authorizePermission('UPLOAD_IMAGES'),
    upload.single('image'),
    uploadImage
);

// Update image route (deletes old image and uploads new one)
router.put('/image',
    authorizePermission('UPLOAD_IMAGES'),
    upload.single('image'),
    updateImage
);

// Delete image route
router.delete('/image',
    authorizePermission('UPLOAD_IMAGES'),
    deleteImage
);

module.exports = router; 