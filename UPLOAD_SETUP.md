# File Upload Setup with Docker Persistent Storage

## Overview

This document explains how the file upload system is configured to persist uploaded files across Docker container updates using Docker volumes.

## Problem Solved

Previously, uploaded files were stored inside the Docker container at `/app/uploads`. When the container was updated/recreated during CI/CD deployments, all uploaded files were lost because they existed only within the container's filesystem.

## Solution

We now use Docker volumes to mount a host directory to the container's upload directory, ensuring files persist across container updates.

## Architecture

```
Host Machine: /home/loyalty/loyalty-uploads
                    ↓ (mounted as volume)
Docker Container: /app/uploads
                    ↓ (served via Express static middleware)
Public URL: http://your-domain/uploads/filename.jpg
```

## Configuration Details

### 1. Docker Volume Mount

In `.github/workflows/new-deploy.yml`:

```bash
# Create persistent directory on host
mkdir -p /home/loyalty/loyalty-uploads

# Mount host directory to container
docker run -d \
  --name loyalty-backend-container \
  -v /home/loyalty/loyalty-uploads:/app/uploads \
  loyalty-backend-img
```

### 2. Upload Controller

File: `src/modules/upload/upload-local.controller.js`

- **Upload Path**: `/app/uploads` (mounted volume)
- **File Size Limit**: 10MB per file
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Max Files**: 10 files for multiple upload
- **Filename Format**: `fieldname-timestamp-random.extension`

### 3. Static File Serving

File: `src/config/express.js`

```javascript
// Serve uploaded files publicly
app.use(
  "/uploads",
  express.static("/app/uploads", {
    maxAge: "1d",
    etag: true,
    lastModified: true,
  })
);
```

## API Endpoints

### Upload Single Photo

```http
POST /api/upload/single
Content-Type: multipart/form-data

Body:
- photo: [file]
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "photo-1703123456789-123456789.jpg",
    "originalName": "my-image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "url": "/uploads/photo-1703123456789-123456789.jpg",
    "path": "/app/uploads/photo-1703123456789-123456789.jpg",
    "uploadedAt": "2023-12-21T10:30:00.000Z"
  }
}
```

### Upload Multiple Photos

```http
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
- photos: [file1, file2, ...]
```

**Response:**

```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "data": {
    "files": [
      {
        "filename": "photos-1703123456789-123456789.jpg",
        "originalName": "image1.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "url": "/uploads/photos-1703123456789-123456789.jpg",
        "path": "/app/uploads/photos-1703123456789-123456789.jpg"
      }
    ],
    "count": 3,
    "uploadedAt": "2023-12-21T10:30:00.000Z"
  }
}
```

### Get Upload Information

```http
GET /api/upload/info
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uploadPath": "/app/uploads",
    "directoryExists": true,
    "fileCount": 25,
    "totalSize": "45.67 MB",
    "maxFileSize": "10 MB",
    "allowedTypes": [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp"
    ],
    "maxFiles": 10
  }
}
```

## File Access

Once uploaded, files can be accessed via:

```
http://your-domain/uploads/filename.jpg
```

## Directory Structure

```
Host Machine:
/home/loyalty/loyalty-uploads/
├── photo-1703123456789-123456789.jpg
├── photos-1703123456790-987654321.png
└── ...

Docker Container:
/app/uploads/ (mounted from host)
├── photo-1703123456789-123456789.jpg
├── photos-1703123456790-987654321.png
└── ...
```

## Benefits

1. **Persistence**: Files survive container updates and restarts
2. **Performance**: Direct file serving without database overhead
3. **Scalability**: Easy to backup and manage files on host system
4. **Security**: Proper file type validation and size limits
5. **Monitoring**: Upload info endpoint for system monitoring

## Security Features

- File type validation (images only)
- File size limits (10MB max)
- Unique filename generation to prevent conflicts
- XSS protection on file uploads
- Static file caching with proper headers

## Backup Considerations

The upload directory `/home/loyalty/loyalty-uploads` should be included in your backup strategy:

```bash
# Example backup command
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /home/loyalty/loyalty-uploads
```

## Monitoring

Use the `/api/upload/info` endpoint to monitor:

- Upload directory status
- File count and total size
- System configuration

## Troubleshooting

### Files Not Persisting

- Check if volume mount is correct in deployment
- Verify host directory permissions
- Ensure Docker has access to host directory

### Upload Failures

- Check file size (max 10MB)
- Verify file type (images only)
- Check disk space on host machine
- Review application logs for detailed errors

### Access Issues

- Verify static file middleware is configured
- Check file permissions in upload directory
- Ensure files exist in mounted volume

## Development vs Production

### Development

- Files stored locally in project directory
- No volume mount needed for local development

### Production

- Files stored in persistent host directory
- Volume mount ensures persistence across deployments
- Proper backup and monitoring in place
