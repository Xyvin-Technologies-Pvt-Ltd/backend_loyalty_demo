const mongoose = require("mongoose");

// Points Criteria Schema
const pointsCriteriaSchema = new mongoose.Schema(
  {
    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TriggerEvent",
      required: true,
    },
    unique_code: {
      type: String,
      unique: true,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    serviceType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TriggerServices",
      required: true,
    },

    appType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppType",
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    //point-earning-system , not discount system

    pointSystem: [
      {
        paymentMethod: {
          type: String,
        },
        pointType: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        pointRate: { type: Number },
      },
    ],

    conditions: {
      maxTransactions: {
        weekly: { type: Number, default: null },
        monthly: { type: Number, default: null },
      },
      transactionValueLimits: {
        minValue: { type: Number, default: 0 },
        maxValue: { type: Number, default: null },
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

pointsCriteriaSchema.methods.calculatePoints = function (
  paymentMethod,
  transactionValue
) {
  // Check if criteria is active
  if (!this.isActive) {
    return {
      success: false,
      message: "Point criteria is not active",
      points: 0,
    };
  }

  // Find the applicable point system for the payment method
  const pointSystemEntry = this.pointSystem.find(
    (point) => point.paymentMethod === paymentMethod
  );

  if (!pointSystemEntry) {
    return {
      success: false,
      message: "No point system found for this payment method",
      points: 0,
    };
  }

  // Check if transaction value meets minimum requirement
  if (transactionValue < this.conditions.transactionValueLimits.minValue) {
    return {
      success: false,
      message: "Transaction value is below the minimum required",
      points: 0,
    };
  }

  // Calculate points based on point type (percentage or fixed)
  let calculatedPoints = 0;
  const { pointType, pointRate } = pointSystemEntry;

  if (pointType === "percentage") {
    let applicableValue = transactionValue;

    // If max value is set and transaction exceeds it, cap at max value
    if (
      this.conditions.transactionValueLimits.maxValue !== null &&
      transactionValue > this.conditions.transactionValueLimits.maxValue
    ) {
      applicableValue = this.conditions.transactionValueLimits.maxValue;
    }

    calculatedPoints = Math.round((applicableValue * pointRate) / 100);
  } else {
    // Fixed point value
    calculatedPoints = pointRate;
  }

  return {
    success: true,
    message: "Points calculated successfully",
    points: calculatedPoints,
    calculationDetails: {
      pointType,
      pointRate,
      transactionValue,
    },
  };
};

pointsCriteriaSchema.methods.checkTransactionLimits = function (
  customerTransactions
) {
  // If no transactions or no limits set, allow the transaction
  if (!customerTransactions || customerTransactions.length === 0) {
    return {
      withinLimits: true,
    };
  }

  const now = new Date();

  // Calculate start of week (last 7 days from today)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  // Calculate start of month (first day of current month)
  const startOfMonth = new Date(now);
  startOfMonth.setDate(1);

  // Count weekly and monthly transactions
  const weeklyTransactions = customerTransactions.filter(
    (tx) => new Date(tx.createdAt) >= startOfWeek
  ).length;

  const monthlyTransactions = customerTransactions.filter(
    (tx) => new Date(tx.createdAt) >= startOfMonth
  ).length;

  // Check weekly limits
  if (
    this.conditions.maxTransactions.weekly !== null &&
    weeklyTransactions >= this.conditions.maxTransactions.weekly
  ) {
    return {
      withinLimits: false,
      message: "Weekly transaction limit exceeded",
      currentCount: weeklyTransactions,
      limit: this.conditions.maxTransactions.weekly,
    };
  }

  // Check monthly limits
  if (
    this.conditions.maxTransactions.monthly !== null &&
    monthlyTransactions >= this.conditions.maxTransactions.monthly
  ) {
    return {
      withinLimits: false,
      message: "Monthly transaction limit exceeded",
      currentCount: monthlyTransactions,
      limit: this.conditions.maxTransactions.monthly,
    };
  }

  // Both limits are within range
  return {
    withinLimits: true,
    weeklyCount: weeklyTransactions,
    monthlyCount: monthlyTransactions,
    weeklyLimit: this.conditions.maxTransactions.weekly,
    monthlyLimit: this.conditions.maxTransactions.monthly,
  };
};

pointsCriteriaSchema.methods.checkTransactionLimitsAggregated = async function (
  customerId
) {
  try {
    const now = new Date();

    // Calculate start dates
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);

    // Use aggregation to get counts directly from database
    const Transaction = mongoose.model("Transaction");
    const aggregationResult = await Transaction.aggregate([
      {
        $match: {
          customer_id: mongoose.Types.ObjectId(customerId),
          point_criteria: this._id,
          status: "success",
          transaction_type: "earn",
        },
      },
      {
        $facet: {
          weeklyCount: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" },
          ],
          monthlyCount: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    // Extract counts from aggregation result
    const weeklyCount = aggregationResult[0].weeklyCount[0]?.count || 0;
    const monthlyCount = aggregationResult[0].monthlyCount[0]?.count || 0;

    // Check against limits
    if (
      this.conditions.maxTransactions.weekly !== null &&
      weeklyCount >= this.conditions.maxTransactions.weekly
    ) {
      return {
        withinLimits: false,
        message: "Weekly transaction limit exceeded",
        currentCount: weeklyCount,
        limit: this.conditions.maxTransactions.weekly,
      };
    }

    if (
      this.conditions.maxTransactions.monthly !== null &&
      monthlyCount >= this.conditions.maxTransactions.monthly
    ) {
      return {
        withinLimits: false,
        message: "Monthly transaction limit exceeded",
        currentCount: monthlyCount,
        limit: this.conditions.maxTransactions.monthly,
      };
    }

    return {
      withinLimits: true,
      weeklyCount,
      monthlyCount,
      weeklyLimit: this.conditions.maxTransactions.weekly,
      monthlyLimit: this.conditions.maxTransactions.monthly,
    };
  } catch (error) {
    console.error("Error checking transaction limits:", error);
    // Default to allowing the transaction if there's an error
    return { withinLimits: true, error: error.message };
  }
};

pointsCriteriaSchema.methods.checkEligibility = function (
  paymentMethod,
  transactionValue,
  customerTransactions
) {
  // Check if criteria is active
  if (!this.isActive) {
    return {
      eligible: false,
      message: "Point criteria is not active",
      details: {
        activeStatus: false,
      },
    };
  }

  // Check payment method eligibility
  const pointSystemEntry = this.pointSystem.find(
    (point) => point.paymentMethod === paymentMethod
  );

  if (!pointSystemEntry) {
    return {
      eligible: false,
      message: "Payment method not eligible for points",
      details: {
        supportedPaymentMethods: this.pointSystem.map((p) => p.paymentMethod),
      },
    };
  }

  // Check transaction value limits
  if (transactionValue < this.conditions.transactionValueLimits.minValue) {
    return {
      eligible: false,
      message: "Transaction value below minimum requirement",
      details: {
        currentValue: transactionValue,
        minimumRequired: this.conditions.transactionValueLimits.minValue,
      },
    };
  }

  // Check transaction frequency limits
  const limitsCheck = this.checkTransactionLimits(customerTransactions);
  if (!limitsCheck.withinLimits) {
    return {
      eligible: false,
      message: limitsCheck.message,
      details: limitsCheck,
    };
  }

  // All checks passed
  const pointCalculation = this.calculatePoints(
    paymentMethod,
    transactionValue
  );

  return {
    eligible: true,
    message: "Transaction eligible for points",
    points: pointCalculation.points,
    details: {
      ...pointCalculation.calculationDetails,
      transactionLimits: limitsCheck,
    },
  };
};

pointsCriteriaSchema.methods.checkEligibilityOptimized = async function (
  paymentMethod,
  transactionValue,
  customerId
) {
  // Check if criteria is active
  if (!this.isActive) {
    return {
      eligible: false,
      message: "Point criteria is not active",
      details: {
        activeStatus: false,
      },
    };
  }

  // Check payment method eligibility
  const pointSystemEntry = this.pointSystem.find(
    (point) => point.paymentMethod === paymentMethod
  );

  if (!pointSystemEntry) {
    return {
      eligible: false,
      message: "Payment method not eligible for points",
      details: {
        supportedPaymentMethods: this.pointSystem.map((p) => p.paymentMethod),
      },
    };
  }

  // Check transaction value limits
  if (transactionValue < this.conditions.transactionValueLimits.minValue) {
    return {
      eligible: false,
      message: "Transaction value below minimum requirement",
      details: {
        currentValue: transactionValue,
        minimumRequired: this.conditions.transactionValueLimits.minValue,
      },
    };
  }

  // Check transaction frequency limits using aggregation
  const limitsCheck = await this.checkTransactionLimitsAggregated(customerId);
  if (!limitsCheck.withinLimits) {
    return {
      eligible: false,
      message: limitsCheck.message,
      details: limitsCheck,
    };
  }

  // All checks passed
  const pointCalculation = this.calculatePoints(
    paymentMethod,
    transactionValue
  );

  return {
    eligible: true,
    message: "Transaction eligible for points",
    points: pointCalculation.points,
    details: {
      ...pointCalculation.calculationDetails,
      transactionLimits: limitsCheck,
    },
  };
};

pointsCriteriaSchema.statics.findMatchingCriteria = async function (
  unique_code
) {
  try {
    const criteria = await this.findOne({
      unique_code: unique_code,
      isActive: true,
    });

    return criteria;
  } catch (error) {
    console.error("Error finding matching point criteria:", error);
    return null;
  }
};

pointsCriteriaSchema.statics.getSupportedPaymentMethods = async function () {
  try {
    const results = await this.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$pointSystem" },
      { $group: { _id: "$pointSystem.paymentMethod" } },
      { $project: { _id: 0, paymentMethod: "$_id" } },
    ]);

    return results.map((item) => item.paymentMethod);
  } catch (error) {
    console.error("Error getting supported payment methods:", error);
    return [];
  }
};

// Add indexes for better query performance
pointsCriteriaSchema.index({ eventType: 1, serviceType: 1, appType: 1 });
pointsCriteriaSchema.index({ isActive: 1 });

const PointsCriteria = mongoose.model("PointsCriteria", pointsCriteriaSchema);

module.exports = PointsCriteria;
