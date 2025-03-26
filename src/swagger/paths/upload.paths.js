module.exports = {
    '/upload/image': {
        post: {
            tags: ['Image Upload'],
            summary: 'Upload new image to S3',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                image: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'Image file to upload'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Image uploaded successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'number' },
                                    message: { type: 'string' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            url: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'No image file provided'
                },
                500: {
                    description: 'Error uploading image'
                }
            }
        },
        put: {
            tags: ['Image Upload'],
            summary: 'Update existing image in S3',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                image: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'New image file to upload'
                                },
                                oldImageUrl: {
                                    type: 'string',
                                    description: 'URL of the image to be replaced'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Image updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'number' },
                                    message: { type: 'string' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            url: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'No image file provided'
                },
                500: {
                    description: 'Error updating image'
                }
            }
        },
        delete: {
            tags: ['Image Upload'],
            summary: 'Delete image from S3',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['imageUrl'],
                            properties: {
                                imageUrl: {
                                    type: 'string',
                                    description: 'URL of the image to delete'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Image deleted successfully'
                },
                400: {
                    description: 'No image URL provided'
                },
                500: {
                    description: 'Error deleting image'
                }
            }
        }
    }
}; 