# Loyalty App Server Architecture Guide

## System Requirements Overview

This document outlines the recommended server architecture and requirements for deploying the Loyalty App platform to support:

- **5,000 concurrent users per day**
- **35,000 API transactions per day**
- **Reliable performance with cost efficiency**
- **Room for moderate growth**

## Architecture Diagram

```
                      ┌─────────────────────────────┐
                      │        Internet             │
                      └───────────────┬─────────────┘
                                     │
                                     │
                 ┌──────────────────┐│┌────────────────────┐
                 │                  ││                     │
                 │ Mobile/Web Apps  │├─────►  Web Frontend │
                 │                  ││      (Admin/Staff)  │
                 └────────┬─────────┘│└────────┬───────────┘
                          │          │         │
                          │          │         │
                          ▼          ▼         ▼
                    ┌─────────────────────────────┐
                    │         NGINX               │  ← Reverse proxy, SSL, load balancing
                    └────────────┬────────────────┘
                                 │
                                 │
                    ┌────────────▼─────────────┐
                    │ Loyalty App (Node.js)    │  ← REST API Backend
                    └────────────┬─────────────┘
                                 │
      ┌──────────────────────────┴─────────────────────────┐
      │                                                    │
┌─────▼──────────┐                               ┌─────────▼────────┐
│   MongoDB      │                               │     Redis        │
│ (replica set)  │ ← Main DB                     │                  │ ← Caching, sessions
└────────────────┘                               └──────────────────┘

                  ┌────────────────────────┐
                  │  Local File Storage    │  ← Instead of AWS S3
                  │  (/mnt/storage, etc.)  │
                  └────────────────────────┘
```

## Communication Flow

The system follows a standard client-server architecture where:

1. **Mobile/Web Apps** make HTTP(S) requests to the backend REST API endpoints
2. **Web Frontend** for administrators and staff also communicates with the same backend
3. **Node.js Backend** processes the requests, applies business logic, and interacts with MongoDB
4. **MongoDB** stores all loyalty program data including users, transactions, and points
5. **Redis** provides caching and session management to improve performance

This architecture allows for:

- Clean separation between client applications and the backend
- Single source of truth for data via centralized API endpoints
- Ability to develop and update mobile apps and admin frontends independently
- Consistent business logic enforcement across all clients

## Infrastructure Components

### 1. Load Balancer & Reverse Proxy

- **Hardware**: Cloud-based or dedicated server
- **Software**: NGINX
- **Specifications**:
  - 2 CPU cores
  - 4GB RAM
  - SSD storage
  - 1Gbps network connection
- **Configuration**:
  - SSL termination
  - Basic health checks
  - Session persistence
  - Rate limiting
  - Routes requests to appropriate services (API backend, frontend assets)

### 2. Application Server (Node.js)

- **Quantity**: 2 servers (1 primary, 1 secondary for failover)
- **Hardware per server**:
  - 4 CPU cores
  - 16GB RAM
  - 250GB SSD storage
  - 1Gbps network connection
- **Software**:
  - Node.js (LTS version)
  - PM2 process manager
- **Responsibilities**:
  - Hosts REST API endpoints for mobile apps and web frontend
  - Processes business logic and data validation
  - Manages authentication and authorization
  - Connects to MongoDB for data persistence
  - Utilizes Redis for caching and session management
- **Scaling strategy**:
  - Vertical scaling initially
  - Horizontal scaling when needed

### 3. Database (MongoDB)

- **Architecture**: Replica set with 2 nodes (primary + secondary)
- **Hardware per node**:
  - 4 CPU cores
  - 16GB RAM
  - 500GB SSD storage
  - 1Gbps network connection
- **Configuration**:
  - Write concern: majority
  - Read preference: nearest
  - Proper indexing on all frequently queried fields

### 4. Caching Layer (Redis)

- **Architecture**: Single Redis instance with periodic snapshots
- **Hardware**:
  - 2 CPU cores
  - 8GB RAM
  - 100GB SSD storage
  - 1Gbps network connection
- **Configuration**:
  - Persistence enabled (AOF + RDB)
  - Eviction policy: volatile-lru
  - Maxmemory configuration with 75% memory limit

### 5. Monitoring and Logging

- **Tools**:
  - Prometheus + Grafana for metrics
  - Winston & Morgan for logging
- **Hardware**: Co-located with application server
  - No dedicated server needed at this scale

## Frontend Solutions

### Option 1: Integrated with Backend (Recommended for simplicity)

- Frontend assets (HTML, CSS, JS) served directly by Node.js application
- Uses Express static middleware to serve frontend files
- Benefits:
  - Simplified deployment and management
  - Reduced infrastructure complexity
  - Lower cost
  - Same-origin requests (no CORS issues)

### Option 2: Containerized Separation

- Frontend (Vite + React) runs in dedicated Docker container
- Backend (Node.js) runs in separate Docker container
- Nginx routes requests to appropriate container
- Benefits:
  - Better separation of concerns
  - Independent scaling and deployment
  - Consistent development environments

## Performance Optimizations

### Database Optimizations

- Implement proper indexing for all frequently accessed fields
- Use database connection pooling
- Configure appropriate write concern for balance of performance and data safety

### Application Optimizations

- Enable Node.js clustering to utilize all CPU cores
- Implement request batching for bulk operations
- Configure appropriate garbage collection parameters
- API response caching for frequently accessed data

### Caching Strategy

- Cache frequently accessed data:
  - Theme settings
  - Point criteria rules
  - Loyalty points structure
  - User profile information (with short TTL)
- Set appropriate TTL for different data types

### API Optimizations

- Implement proper rate limiting
- Use compression for response payloads
- Implement pagination for list endpoints
- Optimize payload size

## High Availability and Disaster Recovery

### Availability Measures

- Secondary application server for failover
- MongoDB replica for database redundancy
- Regular health checks

### Backup Strategy

- **Database**:
  - Daily full backups
  - Incremental backups every 12 hours
- **Application**:
  - Configuration backups
  - User-uploaded content backup
- Backup retention period: 14 days

### Disaster Recovery

- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 12 hours
- Documented recovery procedures

## Security Measures

- Basic Web Application Firewall (WAF)
- Regular security audits
- API key management
- Rate limiting and throttling to prevent abuse
- Data encryption at rest and in transit
- Secure API communication between mobile apps and backend

## Scaling Considerations

### Vertical Scaling

- Increase resources (CPU, RAM) as needed for database and application servers

### Horizontal Scaling

- Add more application nodes if user base grows significantly

## Capacity Planning

### Current Requirements

- 5,000 concurrent users per day
- 35,000 daily API transactions
- Approximately 0.4 transactions per second (average)
- Peak load: 2-3 transactions per second (estimated)

### Future Growth

- Monitor resource utilization and plan capacity increases accordingly
- Review and adjust infrastructure every 6 months

## Implementation Options

### Option 1: Simplified Single-Server Setup

For the most cost-effective approach, you can run all components on a single powerful server:

| **Component** | **Specification**                          |
| ------------- | ------------------------------------------ |
| CPU           | 8 cores (Intel Xeon or AMD EPYC)           |
| RAM           | 32 GB                                      |
| Storage       | 500 GB SSD (for MongoDB, app files, cache) |
| Network       | 1 Gbps LAN card                            |
| OS            | Ubuntu Server 22.04 LTS                    |
| Backup Drive  | External 1TB HDD or NAS                    |

### Option 2: Two-Server Setup (Recommended)

For better reliability and separation of concerns:

| **Server Role** | **CPU** | **RAM** | **Storage** | **Notes**                 |
| --------------- | ------- | ------- | ----------- | ------------------------- |
| App + NGINX     | 4 cores | 16GB    | 250GB SSD   | Run Node.js, NGINX, Redis |
| MongoDB         | 4 cores | 16GB    | 500GB SSD   | Dedicated DB server       |

## Cost Considerations

The estimated monthly infrastructure cost for this setup ranges from $500 to $1,500 USD, depending on:

- Cloud provider selection vs. on-premises hardware
- Reserved instance commitments
- Storage requirements growth
- Geographic location

## Conclusion

This architecture is designed to provide a cost-effective, reliable infrastructure for the Loyalty App platform, capable of supporting 5,000 concurrent users and 35,000 daily API transactions. It offers good performance and reliability while maintaining reasonable costs.

The architecture can be implemented on major cloud providers (AWS, Azure, Google Cloud) or as an on-premise solution, depending on organizational requirements and constraints.
