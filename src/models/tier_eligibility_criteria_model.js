const mongoose = require("mongoose");

const tierEligibilityCriteriaSchema = new mongoose.Schema(
  {
    tier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
      required: true,
      unique: true,
    },

    // Net earning requirement per period
    net_earning_required: {
      type: Number,
      required: true,
      min: 0,
      description:
        "Minimum net points required to be earned per evaluation period",
    },

    // Evaluation period in days
    evaluation_period_days: {
      type: Number,
      required: true,
      min: 1,
      description: "Number of days in each evaluation period",
    },

    // Number of consecutive periods required
    consecutive_periods_required: {
      type: Number,
      required: true,
      min: 1,
      description: "Number of consecutive periods customer must meet criteria",
    },

    // App type specific criteria (optional)
    app_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppType",
      default: null,
      description: "If specified, criteria applies only to this app type",
    },

    // Whether this criteria is active
    is_active: {
      type: Boolean,
      default: true,
    },

    // Additional settings
    settings: {
      // Whether to check for consecutive periods or just total periods
      require_consecutive: {
        type: Boolean,
        default: true,
        description:
          "If true, periods must be consecutive. If false, can be any periods within timeframe",
      },

      // Grace period for missed periods
      grace_periods_allowed: {
        type: Number,
        default: 0,
        min: 0,
        description: "Number of periods that can be missed and still qualify",
      },

      // Whether to use calendar months instead of rolling periods
      use_calendar_months: {
        type: Boolean,
        default: true,
        description:
          "If true, periods are based on calendar months. If false, uses rolling periods based on evaluation_period_days",
      },
    },

    // Audit fields
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
tierEligibilityCriteriaSchema.index({ tier_id: 1 });
tierEligibilityCriteriaSchema.index({ tier_id: 1, app_type: 1 });
tierEligibilityCriteriaSchema.index({ is_active: 1 });

// Static method to get criteria for a specific tier
tierEligibilityCriteriaSchema.statics.getCriteriaForTier = async function (
  tier_id,
  app_type = null
) {
  const query = {
    tier_id: tier_id,
    is_active: true,
  };

  if (app_type) {
    // Try to find app-specific criteria first, then fall back to general criteria
    const appSpecific = await this.findOne({ ...query, app_type: app_type });
    if (appSpecific) return appSpecific;
  }

  // Return general criteria (app_type is null)
  return await this.findOne({ ...query, app_type: null });
};

// Method to validate if customer meets the criteria
tierEligibilityCriteriaSchema.methods.validateCustomerEligibility =
  async function (customer_id, session = null) {
    const Transaction = require("./transaction_model");

    try {
      // Current date for reference
      const currentDate = new Date();

      // Get the first day of the current month
      const currentMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      // Calculate the start date (going back consecutive_periods_required months)
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - this.consecutive_periods_required + 1,
        1
      );

      // Group transactions by calendar months
      const periods = [];

      // Generate periods for the last consecutive_periods_required months
      for (let i = this.consecutive_periods_required - 1; i >= 0; i--) {
        // First day of month
        const periodStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );

        // Last day of month (0th day of next month is last day of current month)
        const periodEnd = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i + 1,
          0
        );

        // Set time to end of day for the end date
        periodEnd.setHours(23, 59, 59, 999);

        // Get transactions for this month
        const periodTransactions = await Transaction.find({
          customer_id: customer_id,
          transaction_date: {
            $gte: periodStart,
            $lte: periodEnd,
          },
          transaction_type: { $in: ["earn", "adjust"] },
          status: "completed",
        }).session(session);

        // Calculate net earnings for this month
        const netEarned = periodTransactions.reduce((total, transaction) => {
          if (
            transaction.transaction_type === "earn" ||
            (transaction.transaction_type === "adjust" &&
              transaction.points > 0)
          ) {
            return total + Math.abs(transaction.points);
          } else if (transaction.transaction_type === "redeem") {
            return total - Math.abs(transaction.points);
          }
          return total;
        }, 0);

        // Add period to the list with month name for better readability
        periods.push({
          start: periodStart,
          end: periodEnd,
          netEarned: netEarned,
          meetsRequirement: netEarned >= this.net_earning_required,
          month: periodStart.toLocaleString("default", { month: "long" }),
          year: periodStart.getFullYear(),
        });
      }

      // Check if criteria is met
      let qualifyingPeriods = 0;
      let consecutiveQualifying = 0;
      let maxConsecutive = 0;

      for (const period of periods) {
        if (period.meetsRequirement) {
          qualifyingPeriods++;
          consecutiveQualifying++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveQualifying);
        } else {
          consecutiveQualifying = 0;
        }
      }

      const meetsRequirement = this.settings.require_consecutive
        ? maxConsecutive >= this.consecutive_periods_required
        : qualifyingPeriods >= this.consecutive_periods_required;

      return {
        eligible: meetsRequirement,
        details: {
          periods_checked: periods.length,
          qualifying_periods: qualifyingPeriods,
          consecutive_qualifying: maxConsecutive,
          required_periods: this.consecutive_periods_required,
          period_breakdown: periods,
          criteria: {
            net_earning_required: this.net_earning_required,
            evaluation_period_days: this.evaluation_period_days,
            require_consecutive: this.settings.require_consecutive,
            use_calendar_months: true,
          },
        },
      };
    } catch (error) {
      console.error("Error validating customer eligibility:", error);
      return {
        eligible: false,
        error: error.message,
        details: null,
      };
    }
  };

const TierEligibilityCriteria = mongoose.model(
  "TierEligibilityCriteria",
  tierEligibilityCriteriaSchema
);

module.exports = TierEligibilityCriteria;
