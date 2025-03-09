# Loyalty Backend Server Configuration

This document provides a comprehensive overview of the server configuration and DevOps infrastructure for the Loyalty Backend application. It details the technologies used, configuration options, deployment strategies, and best practices for maintaining and scaling the system.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Docker Containerization](#docker-containerization)
3. [Redis Implementation](#redis-implementation)
4. [Background Job Processing](#background-job-processing)
5. [Application Monitoring](#application-monitoring)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Environment Configuration](#environment-configuration)
8. [Scaling Strategies](#scaling-strategies)
9. [Backup and Recovery](#backup-and-recovery)
10. [Security Considerations](#security-considerations)

## System Architecture

The Loyalty Backend system is built with a microservices-inspired architecture, containerized using Docker, and orchestrated with Docker Compose. The system consists of the following components:

- **Node.js Application**: The core backend application built with Express.js
- **MongoDB**: Primary database for storing loyalty program data
- **Redis**: Used for caching and background job processing
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Visualization of metrics and dashboards

### Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Load Balancer  │────▶│  Node.js App    │
│                 │     │  (Container)    │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Redis       │◀───▶│    MongoDB      │     │   Prometheus    │
│   (Container)   │     │   (Container)   │     │   (Container)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │                 │
                                               │    Grafana      │
                                               │   (Container)   │
                                               └─────────────────┘
```

## Docker Containerization

The application is containerized using Docker to ensure consistency across development, testing, and production environments.

### Dockerfile

The `Dockerfile` defines how the application is built and packaged:

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]
```

### Docker Compose

The `docker-compose.yml` file orchestrates the multi-container application:

```yaml
version: "3.8"

services:
  # Node.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: loyalty-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/loyalty_app
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your_jwt_secret_here
      - API_VERSION=v1
      - BASE_PATH=/api
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./logs:/usr/src/app/logs
    networks:
      - loyalty-network

  # MongoDB Service
  mongodb:
    image: mongo:6
    container_name: loyalty-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - loyalty-network

  # Redis Service
  redis:
    image: redis:7-alpine
    container_name: loyalty-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - loyalty-network

  # Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: loyalty-prometheus
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - loyalty-network

  # Visualization with Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: loyalty-grafana
    restart: always
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - loyalty-network

networks:
  loyalty-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

### Use Cases

- **Development**: Developers can use Docker Compose to spin up a complete development environment with a single command.
- **Testing**: CI/CD pipelines can use the same Docker configuration to ensure consistent testing environments.
- **Production**: The same containers can be deployed to production, ensuring what works in development works in production.

### Benefits

- **Consistency**: Eliminates "it works on my machine" problems by packaging the application with its dependencies.
- **Isolation**: Each component runs in its own container, preventing conflicts.
- **Scalability**: Containers can be easily scaled horizontally.
- **Portability**: The application can run on any system that supports Docker.

## Redis Implementation

Redis is used for two primary purposes: caching API responses and supporting background job processing.

### Redis Configuration

The Redis client is configured in `src/config/redis.js`:

```javascript
const Redis = require("ioredis");
const { logger } = require("../middlewares/logger");

// Get Redis configuration from environment variables
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
const REDIS_DB = process.env.REDIS_DB || 0;

// Create Redis client
const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  db: REDIS_DB,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});
```

### Caching Middleware

The caching middleware in `src/middlewares/cache.middleware.js` provides a way to cache API responses:

```javascript
const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Generate cache key
    const key = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get data from cache
      const cachedData = await getCache(key);

      if (cachedData) {
        logger.debug("Cache hit", { key });
        return res.status(200).json(cachedData);
      }

      // Cache miss, capture the response
      const originalSend = res.json;

      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, data, ttl).catch((err) =>
            logger.error("Error setting cache", { error: err.message, key })
          );
        }

        originalSend.call(this, data);
      };

      logger.debug("Cache miss", { key });
      next();
    } catch (error) {
      logger.error("Cache middleware error", { error: error.message });
      next();
    }
  };
};
```

### Use Cases

- **Frequently Accessed Data**: Customer profiles, tier information, and point balances can be cached to reduce database load.
- **Read-Heavy Endpoints**: Endpoints that are frequently accessed but rarely updated (e.g., loyalty program rules) benefit from caching.
- **API Response Caching**: Reduces response time for common API requests.

### Benefits

- **Improved Performance**: Reduces database load and improves response times.
- **Reduced Latency**: Cached responses are served much faster than database queries.
- **Scalability**: Helps the application handle more concurrent users by reducing the load on the database.

## Background Job Processing

BullMQ, backed by Redis, is used for processing background jobs such as segment refreshes, email sending, and analytics processing.

### Queue Configuration

The queue configuration in `src/config/queue.js` sets up various queues for different types of background jobs:

```javascript
const { Queue, Worker, QueueScheduler } = require("bullmq");

// Define queues
const queues = {
  // Email queue for sending emails
  email: new Queue("email", { connection }),

  // Notification queue for push notifications
  notification: new Queue("notification", { connection }),

  // Points processing queue
  points: new Queue("points", { connection }),

  // Segment refresh queue
  segmentRefresh: new Queue("segment-refresh", { connection }),

  // Export queue for data exports
  export: new Queue("export", { connection }),

  // Analytics queue for processing analytics data
  analytics: new Queue("analytics", { connection }),
};
```

### Segment Refresh Job

The segment refresh job in `src/jobs/segment_refresh.job.js` demonstrates how background jobs are implemented:

```javascript
const refreshSegmentsJob = async () => {
  try {
    logger.info("Starting segment refresh job");

    const now = new Date();
    const hourOfDay = now.getHours();
    const dayOfWeek = now.getDay();

    // Get segments that need to be refreshed
    const segments = await CustomerSegment.find({
      status: "active",
      "auto_refresh.enabled": true,
    });

    logger.info(`Found ${segments.length} segments with auto-refresh enabled`);

    // Process each segment based on its refresh frequency
    for (const segment of segments) {
      try {
        const { frequency } = segment.auto_refresh;

        // Check if segment should be refreshed based on frequency
        let shouldRefresh = false;

        if (frequency === "hourly") {
          shouldRefresh = true;
        } else if (frequency === "daily" && hourOfDay === 1) {
          // Run daily at 1 AM
          shouldRefresh = true;
        } else if (
          frequency === "weekly" &&
          dayOfWeek === 1 &&
          hourOfDay === 1
        ) {
          // Run weekly on Monday at 1 AM
          shouldRefresh = true;
        }

        if (shouldRefresh) {
          // Add segment refresh job to queue
          await addJob(
            "segmentRefresh",
            "processSegment",
            { segmentId: segment._id.toString() },
            {
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 5000,
              },
            }
          );

          logger.info(`Queued refresh for segment: ${segment.name}`);
        }
      } catch (error) {
        logger.error(
          `Error processing segment ${segment._id}: ${error.message}`
        );
      }
    }

    logger.info("Segment refresh job completed");
  } catch (error) {
    logger.error(`Segment refresh job error: ${error.message}`);
  }
};
```

### Use Cases

- **Customer Segmentation**: Refreshing customer segments based on transaction data.
- **Email Campaigns**: Sending bulk emails to customers.
- **Push Notifications**: Sending push notifications to mobile devices.
- **Data Exports**: Generating and exporting reports.
- **Analytics Processing**: Processing and aggregating analytics data.

### Benefits

- **Asynchronous Processing**: Long-running tasks don't block the main application thread.
- **Reliability**: Failed jobs can be retried automatically.
- **Scalability**: Job processing can be scaled independently of the main application.
- **Monitoring**: Job processing can be monitored and tracked.

## Application Monitoring

Prometheus and Grafana are used for monitoring the application's performance and health.

### Prometheus Configuration

The Prometheus configuration in `prometheus.yml` defines what metrics to collect:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "loyalty-backend"
    static_configs:
      - targets: ["app:3000"]
    metrics_path: "/metrics"

  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "node-exporter"
    static_configs:
      - targets: ["node-exporter:9100"]
```

### Metrics Middleware

The metrics middleware in `src/middlewares/metrics.middleware.js` collects and exposes application metrics:

```javascript
const promClient = require("prom-client");
const register = new promClient.Registry();

// Add default metrics (memory, CPU, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP request counter
const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// HTTP request duration histogram
const httpRequestDurationMs = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
  registers: [register],
});
```

### Use Cases

- **Performance Monitoring**: Track response times, request rates, and error rates.
- **Resource Utilization**: Monitor CPU, memory, and disk usage.
- **Database Performance**: Track database query performance and connection pool usage.
- **Cache Effectiveness**: Monitor cache hit rates and cache size.
- **Job Processing**: Track job processing rates, durations, and failure rates.

### Benefits

- **Proactive Issue Detection**: Identify issues before they affect users.
- **Performance Optimization**: Identify bottlenecks and optimize performance.
- **Capacity Planning**: Plan for scaling based on actual usage patterns.
- **Incident Response**: Quickly identify the root cause of incidents.

## CI/CD Pipeline

GitHub Actions is used for continuous integration and continuous deployment.

### CI/CD Workflow

The CI/CD workflow in `.github/workflows/ci-cd.yml` defines the pipeline:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/loyalty_app_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test_jwt_secret

  build:
    name: Build and Push Docker Image
    needs: test
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      - name: Extract branch name
        shell: bash
        run: echo "BRANCH_NAME=${GITHUB_REF#refs/heads/}" >> $GITHUB_ENV

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_HUB_USERNAME }}/loyalty-backend:${{ env.BRANCH_NAME }}
            ${{ secrets.DOCKER_HUB_USERNAME }}/loyalty-backend:${{ env.BRANCH_NAME }}-${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_HUB_USERNAME }}/loyalty-backend:${{ env.BRANCH_NAME }}
          cache-to: type=inline

  deploy-staging:
    name: Deploy to Staging
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to staging server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USERNAME }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/loyalty-backend
            docker-compose pull
            docker-compose up -d
            docker system prune -af

  deploy-production:
    name: Deploy to Production
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USERNAME }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/loyalty-backend
            docker-compose pull
            docker-compose up -d
            docker system prune -af
```

### Use Cases

- **Automated Testing**: Run tests automatically on every pull request and push.
- **Automated Builds**: Build Docker images automatically on successful tests.
- **Automated Deployment**: Deploy to staging and production environments automatically.
- **Quality Control**: Ensure code quality through linting and testing.

### Benefits

- **Faster Delivery**: Automate repetitive tasks to deliver features faster.
- **Consistency**: Ensure consistent build and deployment processes.
- **Quality Assurance**: Catch issues early through automated testing.
- **Reduced Risk**: Smaller, more frequent deployments reduce the risk of major issues.

## Environment Configuration

Environment variables are used to configure the application for different environments.

### Environment Variables

The `.env.example` file documents the required environment variables:

```
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1
BASE_PATH=/api

# MongoDB
MONGODB_URI=mongodb://localhost:27017/loyalty_app
MONGODB_USER=
MONGODB_PASSWORD=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_QUEUE_DB=1

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=30d
JWT_REFRESH_EXPIRY=90d

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@example.com

# Push Notifications
FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json

# SMS
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Swagger
SWAGGER_API_KEY=your_swagger_api_key
SWAGGER_SUPER_ADMIN_TOKEN=your_swagger_super_admin_token

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Use Cases

- **Development**: Configure the application for local development.
- **Testing**: Configure the application for automated testing.
- **Staging**: Configure the application for the staging environment.
- **Production**: Configure the application for the production environment.

### Benefits

- **Security**: Sensitive information is not stored in the codebase.
- **Flexibility**: The application can be configured for different environments without code changes.
- **Simplicity**: Environment-specific configuration is centralized and easy to manage.

## Scaling Strategies

The application is designed to scale horizontally to handle increased load.

### Horizontal Scaling

- **Node.js Application**: Multiple instances can be deployed behind a load balancer.
- **MongoDB**: Can be scaled using replica sets and sharding.
- **Redis**: Can be scaled using Redis Cluster.
- **Background Jobs**: Can be scaled by adding more worker instances.

### Vertical Scaling

- **Node.js Application**: Can be scaled by increasing the resources (CPU, memory) of the host.
- **MongoDB**: Can be scaled by increasing the resources of the host.
- **Redis**: Can be scaled by increasing the resources of the host.

### Auto-Scaling

- **Kubernetes**: The application can be deployed to Kubernetes for auto-scaling based on CPU and memory usage.
- **AWS ECS**: The application can be deployed to AWS ECS for auto-scaling based on CPU and memory usage.

## Backup and Recovery

Regular backups are essential for data protection and disaster recovery.

### MongoDB Backups

- **mongodump**: Regular backups using `mongodump` to create BSON dumps of the database.
- **Automated Backups**: Scheduled backups using cron jobs or backup services.
- **Offsite Storage**: Backups are stored offsite for disaster recovery.

### Redis Backups

- **RDB Snapshots**: Regular RDB snapshots for point-in-time recovery.
- **AOF Logs**: Append-only file logs for more granular recovery.

### Application Logs

- **Log Rotation**: Logs are rotated to prevent disk space issues.
- **Log Aggregation**: Logs are aggregated for centralized monitoring and analysis.

## Security Considerations

Security is a top priority for the loyalty backend system.

### Authentication and Authorization

- **JWT**: JSON Web Tokens are used for authentication.
- **Role-Based Access Control**: Different roles have different permissions.
- **API Keys**: API keys are used for machine-to-machine authentication.

### Data Protection

- **Encryption at Rest**: Sensitive data is encrypted at rest.
- **Encryption in Transit**: All communication is encrypted using TLS.
- **Data Sanitization**: Input data is sanitized to prevent injection attacks.

### Network Security

- **Firewall**: The application is protected by a firewall.
- **Rate Limiting**: Rate limiting is implemented to prevent abuse.
- **CORS**: Cross-Origin Resource Sharing is configured to restrict access.

### Dependency Security

- **Dependency Scanning**: Dependencies are regularly scanned for vulnerabilities.
- **Dependency Updates**: Dependencies are regularly updated to fix security issues.

### Monitoring and Alerting

- **Security Monitoring**: The application is monitored for security issues.
- **Alerting**: Alerts are sent for suspicious activity.
- **Audit Logging**: All security-relevant events are logged for audit purposes.
