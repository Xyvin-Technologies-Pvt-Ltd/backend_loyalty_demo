# Points to Coins Conversion Module

This module handles the conversion of loyalty points to coins within the loyalty management system. It provides functionality for defining conversion rules, calculating conversions, processing point-to-coin conversions, and tracking conversion history.

## Features

- **Conversion Rules Management**: Create, update, and manage rules that define how points are converted to coins
- **Conversion Calculation**: Calculate how many coins a user would receive for a given number of points
- **Points to Coins Conversion**: Process the actual conversion of points to coins for users
- **Conversion History**: Track and retrieve the history of all conversions

## Components

### Models

- **ConversionRule**: Defines the parameters for converting points to coins
- **ConversionHistory**: Records all point-to-coin conversion transactions

### Controllers

- **ConversionRuleController**: Handles CRUD operations for conversion rules
- **ConversionController**: Manages the calculation and processing of conversions
- **ConversionHistoryController**: Retrieves conversion history records

### Routes

- **/conversion/rules**: Endpoints for managing conversion rules
- **/conversion/calculate**: Calculate potential conversion results
- **/conversion/convert**: Process a point-to-coin conversion
- **/conversion/history**: Retrieve conversion history

## Usage Examples

### Creating a Conversion Rule (Admin)

```javascript
// POST /api/v1/conversion/rules
const newRule = {
  name: "Standard Conversion",
  description: "Standard points to coins conversion rate",
  conversionRate: 10, // 10 points = 1 coin
  minPointsRequired: 100,
  maxPointsPerConversion: 10000,
  bonusPercentage: 5, // 5% bonus coins for conversions
  startDate: "2023-01-01",
  endDate: "2023-12-31",
  isActive: true,
};
```

### Calculating a Conversion

```javascript
// POST /api/v1/conversion/calculate
const calculationRequest = {
  points: 1000,
  ruleId: "60f7b0b9e6b3f32d8c9e4567" // Optional, will use best active rule if not provided
};

// Response
{
  "success": true,
  "message": "Conversion calculated successfully",
  "data": {
    "points": 1000,
    "baseCoins": 100,
    "bonusCoins": 5,
    "totalCoins": 105,
    "conversionRate": 10,
    "rule": {
      "_id": "60f7b0b9e6b3f32d8c9e4567",
      "name": "Standard Conversion",
      // ... other rule details
    }
  }
}
```

### Converting Points to Coins

```javascript
// POST /api/v1/conversion/convert
const conversionRequest = {
  points: 1000,
  ruleId: "60f7b0b9e6b3f32d8c9e4567" // Optional
};

// Response
{
  "success": true,
  "message": "Points converted to coins successfully",
  "data": {
    "conversionId": "61f7b0b9e6b3f32d8c9e7890",
    "transactionId": "TRX123456789",
    "points": 1000,
    "baseCoins": 100,
    "bonusCoins": 5,
    "totalCoins": 105,
    "conversionRate": 10,
    "updatedPoints": 2000, // User's remaining points
    "updatedCoins": 305 // User's new coin balance
  }
}
```

### Retrieving Conversion History

```javascript
// GET /api/v1/conversion/history/my
// Response
{
  "success": true,
  "message": "Conversion history retrieved successfully",
  "data": {
    "history": [
      {
        "_id": "61f7b0b9e6b3f32d8c9e7890",
        "user": "60e5a9b2f5e8a23d4c8b4567",
        "points": 1000,
        "coins": 105,
        "bonus": 5,
        "conversionRate": 10,
        "conversionRule": "60f7b0b9e6b3f32d8c9e4567",
        "status": "completed",
        "transactionId": "TRX123456789",
        "createdAt": "2023-01-15T10:30:00.000Z"
        // ... other fields
      }
      // ... more history items
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

## Integration with Other Modules

- **User Module**: Updates user point and coin balances after conversions
- **Transaction Module**: Creates transaction records for point deductions and coin additions
- **Audit Module**: Logs all conversion activities for auditing purposes

## Error Handling

The module includes comprehensive error handling for scenarios such as:

- Insufficient points for conversion
- Invalid conversion rule
- Expired or inactive conversion rules
- Minimum points requirement not met
- Maximum points per conversion exceeded

## Security

All conversion endpoints are protected with appropriate authentication and authorization:

- User endpoints require user authentication
- Admin endpoints require admin authentication and appropriate permissions
