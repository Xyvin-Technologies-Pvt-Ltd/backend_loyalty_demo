# Loyalty Backend Usage Guide

This guide provides step-by-step instructions on how to use the Loyalty Backend system.

## Quick Start

1. **Start the Application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

2. **Access the API Documentation**
Open your browser and navigate to:
```
http://localhost:3000/api-docs
```

## Authentication

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword",
    "name": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

Save the returned JWT token for subsequent requests.

## Managing Loyalty Points

### 1. Add Points to User
```bash
curl -X POST http://localhost:3000/api/v1/points/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "points": 100,
    "reason": "Purchase made"
  }'
```

### 2. Redeem Points
```bash
curl -X POST http://localhost:3000/api/v1/points/redeem \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "points": 50,
    "reason": "Reward redemption"
  }'
```

### 3. Check Points Balance
```bash
curl -X GET http://localhost:3000/api/v1/points/balance/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Managing Rewards

### 1. Create a New Reward
```bash
curl -X POST http://localhost:3000/api/v1/rewards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Free Coffee",
    "pointsRequired": 100,
    "description": "Get a free coffee",
    "validUntil": "2024-12-31"
  }'
```

### 2. List Available Rewards
```bash
curl -X GET http://localhost:3000/api/v1/rewards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Claim a Reward
```bash
curl -X POST http://localhost:3000/api/v1/rewards/claim \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "rewardId": "reward_id"
  }'
```

## User Management

### 1. Get User Profile
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Update User Profile
```bash
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "1234567890"
  }'
```

## Transaction History

### 1. View User Transactions
```bash
curl -X GET http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Filter Transactions
```bash
curl -X GET "http://localhost:3000/api/v1/transactions?type=points_added&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## File Uploads

### 1. Upload User Profile Picture
```bash
curl -X POST http://localhost:3000/api/v1/upload/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

## Error Handling

The API returns standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

Error responses include a message explaining the issue:
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

The API implements rate limiting:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Best Practices

1. Always store JWT tokens securely
2. Implement proper error handling in your client application
3. Cache responses when appropriate
4. Use pagination for large data sets
5. Implement retry logic for failed requests
6. Monitor your API usage to stay within rate limits

## Support

For additional support:
1. Check the API documentation at `/api-docs`
2. Review the error messages carefully
3. Contact the development team for specific issues

## Admin Panel

### Accessing the Admin Panel
1. Navigate to the admin login page:
```
http://localhost:3000/admin/login
```

2. Login with your admin credentials:
```bash
curl -X POST http://localhost:3000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpassword"
  }'
```

### Admin Features

#### 1. User Management
- View all users
- Search users by email, name, or ID
- View user details and transaction history
- Block/unblock users
- Reset user passwords

```bash
# List all users
curl -X GET http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Search users
curl -X GET "http://localhost:3000/api/v1/admin/users/search?query=john" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Block a user
curl -X POST http://localhost:3000/api/v1/admin/users/USER_ID/block \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 2. Points Management
- Add/remove points for any user
- View points transaction history
- Export points data

```bash
# Add points to user
curl -X POST http://localhost:3000/api/v1/admin/points/add \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "points": 1000,
    "reason": "Admin adjustment"
  }'

# View points transactions
curl -X GET http://localhost:3000/api/v1/admin/points/transactions \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 3. Rewards Management
- Create new rewards
- Edit existing rewards
- Delete rewards
- View reward redemption history

```bash
# Create a new reward
curl -X POST http://localhost:3000/api/v1/admin/rewards \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Reward",
    "pointsRequired": 1000,
    "description": "Exclusive premium reward",
    "validUntil": "2024-12-31",
    "quantity": 100
  }'

# View reward redemptions
curl -X GET http://localhost:3000/api/v1/admin/rewards/redemptions \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 4. Reports and Analytics
- View system statistics
- Generate reports
- Export data

```bash
# Get system statistics
curl -X GET http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Generate points report
curl -X GET "http://localhost:3000/api/v1/admin/reports/points?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 5. System Settings
- Configure system parameters
- Manage email templates
- Set up notifications

```bash
# Update system settings
curl -X PUT http://localhost:3000/api/v1/admin/settings \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pointsPerDollar": 10,
    "maxPointsPerTransaction": 1000,
    "pointsExpiryDays": 365
  }'
```

### Admin Security Features
1. Two-factor authentication (2FA)
2. IP whitelisting
3. Session management
4. Activity logging

### Admin Best Practices
1. Always use strong passwords
2. Enable 2FA for admin accounts
3. Regularly review admin activity logs
4. Keep admin credentials secure
5. Use the admin panel only from secure networks
6. Log out after each session
7. Regularly backup important data

### Admin Support
For admin-specific issues:
1. Contact the system administrator
2. Check the admin activity logs
3. Review the admin documentation
4. Use the admin help center 