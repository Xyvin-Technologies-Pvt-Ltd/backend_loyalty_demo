const express = require('express');
const app = express();
const uploadRoutes = require('./modules/upload/upload.routes');

// ... other middleware
app.use('/upload', uploadRoutes);

// ... other imports

module.exports = app; 