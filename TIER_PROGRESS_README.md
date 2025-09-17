# Tier Progress System - Logic Explanation

## Overview

The Tier Progress System is a comprehensive loyalty program feature that tracks customer progress toward tier upgrades. It combines both **point-based thresholds** and **streak-based criteria** to determine when a customer is eligible for the next tier level.

## Core Components

### 1. **Tier Model** (`tier_model.js`)

- **Purpose**: Defines the tier structure and hierarchy
- **Key Fields**:
  - `hierarchy_level`: Numerical order of tiers (1, 2, 3, etc.)
  - `points_required`: Minimum points needed for this tier
  - `name`: Tier name in multiple languages
  - `isActive`: Whether the tier is currently available

### 2. **Tier Eligibility Criteria Model** (`tier_eligibility_criteria_model.js`)

- **Purpose**: Defines advanced requirements beyond just points
- **Key Fields**:
  - `net_earning_required`: Points needed per evaluation period
  - `evaluation_period_days`: Length of each period (typically 30 days)
  - `consecutive_periods_required`: How many periods must be met
  - `app_type`: Optional app-specific criteria
  - `settings.require_consecutive`: Whether periods must be consecutive

### 3. **Customer Model** (`customer_model.js`)

- **Purpose**: Stores customer data and current tier
- **Key Fields**:
  - `tier`: Reference to current tier
  - `total_points`: Lifetime points earned
  - `app_type`: Which apps the customer uses

## How It Works

### Step 1: Find Next Tier

The system identifies the next tier by:

1. Getting the customer's current tier hierarchy level
2. Finding the tier with `hierarchy_level = current_level + 1`
3. If no exact next tier exists, finding any higher tier

### Step 2: Check Eligibility Criteria

For the next tier, the system:

1. Looks for tier-specific eligibility criteria
2. Falls back to app-type specific criteria if available
3. If no criteria exist, uses only point thresholds

### Step 3: Calculate Progress

The system calculates two types of progress:

#### **Points Progress** (Always calculated)

- **Current**: Customer's total lifetime points
- **Required**: Next tier's point threshold
- **Remaining**: Points still needed
- **Percentage**: Progress toward point requirement

#### **Streak Progress** (Only if criteria exist)

- **Periods**: Breaks down time into evaluation periods (usually months)
- **Net Earnings**: Calculates points earned minus redeemed per period
- **Consecutive Requirements**: Tracks if periods must be consecutive
- **Progress**: Shows completion status for each period

## Example Scenarios

### Example 1: Basic Point-Based Progress

**Setup:**

- Customer has 1,500 total points
- Current tier: Bronze (requires 1,000 points)
- Next tier: Silver (requires 2,500 points)

**Result:**

```json
{
  "success": true,
  "currentTier": {
    "id": "bronze_tier_id",
    "name": "Bronze",
    "hierarchy_level": 1,
    "points_required": 1000
  },
  "nextTier": {
    "id": "silver_tier_id",
    "name": "Silver",
    "hierarchy_level": 2,
    "points_required": 2500
  },
  "progress": {
    "points": {
      "current": 1500,
      "required": 2500,
      "remaining": 1000,
      "percentage": 60
    },
    "streak": null
  }
}
```

### Example 2: Advanced Streak-Based Progress

**Setup:**

- Customer has 5,000 total points
- Current tier: Silver (requires 2,500 points)
- Next tier: Gold (requires 5,000 points)
- **Eligibility Criteria for Gold**:
  - Must earn 500 points per month
  - Must do this for 3 consecutive months
  - Current month: January 2024

**Customer's Transaction History:**

- **November 2023**: Earned 600 points, redeemed 50 points = 550 net
- **December 2023**: Earned 400 points, redeemed 100 points = 300 net
- **January 2024**: Earned 700 points, redeemed 100 points = 600 net

**Result:**

```json
{
  "success": true,
  "currentTier": {
    "id": "silver_tier_id",
    "name": "Silver",
    "hierarchy_level": 2,
    "points_required": 2500
  },
  "nextTier": {
    "id": "gold_tier_id",
    "name": "Gold",
    "hierarchy_level": 3,
    "points_required": 5000
  },
  "progress": {
    "points": {
      "current": 5000,
      "required": 5000,
      "remaining": 0,
      "percentage": 100
    },
    "streak": {
      "completed_periods": 2,
      "required_periods": 3,
      "remaining_periods": 1,
      "percentage": 67,
      "period_details": [
        {
          "period_number": 1,
          "period_name": "Period 1",
          "date_range": "1/11/2023 - 30/11/2023",
          "points_earned": 550,
          "points_required": 500,
          "points_remaining": 0,
          "completed": true,
          "percentage": 110
        },
        {
          "period_number": 2,
          "period_name": "Period 2",
          "date_range": "1/12/2023 - 31/12/2023",
          "points_earned": 300,
          "points_required": 500,
          "points_remaining": 200,
          "completed": false,
          "percentage": 60
        },
        {
          "period_number": 3,
          "period_name": "Period 3",
          "date_range": "1/1/2024 - 31/1/2024",
          "points_earned": 600,
          "points_required": 500,
          "points_remaining": 0,
          "completed": true,
          "percentage": 120
        }
      ],
      "is_consecutive": true
    }
  },
  "eligibility_status": "Not yet eligible for upgrade"
}
```

### Example 3: Customer at Highest Tier

**Setup:**

- Customer has 10,000 total points
- Current tier: Platinum (highest tier, level 4)

**Result:**

```json
{
  "success": true,
  "message": "Customer is already at the highest tier level",
  "currentTier": {
    "id": "platinum_tier_id",
    "name": "Platinum",
    "hierarchy_level": 4,
    "points_required": 10000
  },
  "nextTier": null,
  "progress": {
    "points": {
      "current": 10000,
      "required": null,
      "remaining": 0,
      "percentage": 100
    },
    "streak": null
  }
}
```

## API Usage

### Endpoint

```
GET /api/tier/progress/:customerId?app_type=APP_TYPE_ID
```

### Parameters

- `customerId` (required): The customer's ID
- `app_type` (optional): Specific app type for app-specific criteria

### Response Format

The API always returns a consistent structure with:

- `success`: Boolean indicating if the request was successful
- `message`: Human-readable status message
- `currentTier`: Customer's current tier information (null if no tier)
- `nextTier`: Next tier information (null if at highest tier)
- `progress`: Detailed progress breakdown
- `eligibility_status`: Whether customer is eligible for upgrade

## Key Features

### 1. **Flexible Criteria System**

- Supports both simple point thresholds and complex streak requirements
- App-specific criteria for different applications
- Configurable consecutive vs. non-consecutive period requirements

### 2. **Comprehensive Progress Tracking**

- Real-time calculation of both point and streak progress
- Detailed period-by-period breakdown
- Percentage completion for easy UI display

### 3. **Robust Error Handling**

- Graceful handling of missing customers, tiers, or criteria
- Detailed error messages for debugging
- Fallback to basic point-based progress when criteria are missing

### 4. **Performance Optimized**

- Efficient database queries with proper indexing
- Caching support for frequently accessed data
- Minimal data transfer with lean queries

## Business Logic Rules

1. **Tier Hierarchy**: Tiers are ordered by `hierarchy_level` (ascending)
2. **Point Calculation**: Net points = earned points - redeemed points
3. **Period Evaluation**: Uses calendar months by default
4. **Consecutive Requirements**: Can be configured per tier
5. **App-Specific Rules**: Override general criteria when available
6. **Grace Periods**: Support for allowing missed periods (configurable)

## Use Cases

- **Customer Dashboard**: Show progress toward next tier
- **Gamification**: Display achievement progress
- **Marketing**: Target customers close to tier upgrades
- **Analytics**: Track tier progression patterns
- **Notifications**: Alert customers about tier opportunities

This system provides a flexible and comprehensive way to track customer loyalty progression, supporting both simple point-based systems and complex streak-based requirements.
