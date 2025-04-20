# Loyalty Backend Application

A robust backend system for managing loyalty programs, built with Node.js, Express, and MongoDB.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Security](#security)

## Overview

The Loyalty Backend is a comprehensive system designed to manage loyalty programs, rewards, and user engagement. It provides a scalable and secure backend infrastructure with features like user management, reward tracking, and analytics.

## Features

- User authentication and authorization
- Reward point management
- Transaction tracking
- Background job processing
- File upload and management
- Real-time monitoring and metrics
- API documentation with Swagger
- Containerized deployment with Docker

## Tech Stack

- **Backend Framework**: Node.js with Express
- **Database**: MongoDB
- **Cache & Queue**: Redis
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Monitoring**: Prometheus & Grafana
- **Containerization**: Docker
- **API Documentation**: Swagger

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- Docker and Docker Compose
- AWS S3 account (for file storage)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hello-world-ttj/loyalty-backend.git
cd loyalty-backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

## Configuration

The application uses the following configuration files:
- `.env` - Environment variables
- `prometheus.yml` - Prometheus monitoring configuration
- `docker-compose.yml` - Docker services configuration

## API Documentation

The API documentation is available through Swagger UI. After starting the application, visit:
```
http://localhost:3000/api-docs
```

## Development

Start the development server:
```bash
npm run dev
```

Run database seeds:
```bash
npm run seed
```

## Deployment

The application can be deployed using Docker Compose:

```bash
docker-compose up -d
```

This will start all required services:
- Node.js application
- MongoDB
- Redis
- Prometheus
- Grafana

## Monitoring

The application includes:
- Prometheus for metrics collection
- Grafana for visualization
- Winston for logging
- Health check endpoints

## Security

The application implements several security measures:
- JWT authentication
- Input sanitization
- CORS protection
- Helmet security headers
- Rate limiting
- XSS protection

## Project Structure

```
src/
├── config/         # Configuration files
├── helpers/        # Helper functions and utilities
├── jobs/           # Background job definitions
├── middlewares/    # Express middlewares
├── models/         # MongoDB models
├── modules/        # Business logic modules
├── seeds/          # Database seed files
├── swagger/        # API documentation
└── utils/          # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License. 