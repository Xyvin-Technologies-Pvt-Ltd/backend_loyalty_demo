const mongoose = require("mongoose");

const smsMessageSchema = new mongoose.Schema(
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
      maxlength: 160, // Standard SMS length
    },
    type: {
      type: String,
      enum: ["transactional", "promotional", "automated"],
      default: "transactional",
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
      delivered: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
    },
    variables: [
      {
        name: String,
        description: String,
      },
    ],
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
smsMessageSchema.index({ status: 1 });
smsMessageSchema.index({ type: 1 });
smsMessageSchema.index({ scheduled_date: 1 });
smsMessageSchema.index({ sent_date: 1 });

const SmsMessage = mongoose.model("SmsMessage", smsMessageSchema);

module.exports = SmsMessage;
