const mongoose = require("mongoose");

const customerSegmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["transaction", "engagement", "app_type", "device", "custom"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
    criteria: {
      // Transaction-based criteria
      transaction: {
        min_transactions: { type: Number },
        max_transactions: { type: Number },
        min_spend: { type: Number },
        max_spend: { type: Number },
        min_points: { type: Number },
        max_points: { type: Number },
        transaction_period: {
          type: String,
          enum: [
            "last_7_days",
            "last_30_days",
            "last_90_days",
            "last_year",
            "all_time",
          ],
        },
        transaction_types: [
          {
            type: String,
            enum: ["earn", "redeem", "expire", "adjust"],
          },
        ],
        sources: [{ type: String }],
      },

      // Engagement-based criteria
      engagement: {
        app_opens: { type: Number },
        last_active: {
          type: String,
          enum: [
            "today",
            "this_week",
            "this_month",
            "last_month",
            "inactive_30_days",
            "inactive_90_days",
          ],
        },
        email_engagement: {
          open_rate: { type: Number }, // Percentage
          click_rate: { type: Number }, // Percentage
        },
        push_engagement: {
          open_rate: { type: Number }, // Percentage
        },
      },

      // App-type based criteria
      app_type: {
        types: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AppType",
          },
        ],
      },

      // Device-based criteria
      device: {
        types: [
          {
            type: String,
            enum: ["ios", "android", "web", "other"],
          },
        ],
        models: [{ type: String }],
        os_versions: [{ type: String }],
      },

      // Custom criteria (for advanced segmentation)
      custom: {
        query: { type: String }, // MongoDB query string
        description: { type: String },
      },
    },

    // Cached count of customers in this segment
    customer_count: {
      type: Number,
      default: 0,
    },

    // When the segment was last refreshed
    last_refreshed: {
      type: Date,
    },

    // Auto-refresh settings
    auto_refresh: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ["hourly", "daily", "weekly"],
        default: "daily",
      },
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
customerSegmentSchema.index({ name: 1 }, { unique: true });
customerSegmentSchema.index({ type: 1 });
customerSegmentSchema.index({ status: 1 });
customerSegmentSchema.index({ "auto_refresh.enabled": 1 });

const CustomerSegment = mongoose.model(
  "CustomerSegment",
  customerSegmentSchema
);

module.exports = CustomerSegment;
