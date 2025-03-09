const mongoose = require("mongoose");

const pushNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      trim: true,
    },
    action_url: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "draft",
    },
    audience: {
      type: String,
      enum: ["all", "segment", "specific"],
      default: "all",
    },
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerSegment",
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    scheduled_date: {
      type: Date,
    },
    sent_date: {
      type: Date,
    },
    stats: {
      total_sent: {
        type: Number,
        default: 0,
      },
      opened: {
        type: Number,
        default: 0,
      },
      clicked: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
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
pushNotificationSchema.index({ status: 1 });
pushNotificationSchema.index({ scheduled_date: 1 });
pushNotificationSchema.index({ sent_date: 1 });

const PushNotification = mongoose.model(
  "PushNotification",
  pushNotificationSchema
);

module.exports = PushNotification;
