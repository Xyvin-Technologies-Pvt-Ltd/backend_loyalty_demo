const mongoose = require("mongoose");

const emailCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      required: true,
    },
    type: {
      type: String,
      enum: ["marketing", "transactional", "automated"],
      default: "marketing",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "active"],
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
      bounced: {
        type: Number,
        default: 0,
      },
    },
    content_variables: {
      type: Map,
      of: String,
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
emailCampaignSchema.index({ name: 1 });
emailCampaignSchema.index({ status: 1 });
emailCampaignSchema.index({ type: 1 });
emailCampaignSchema.index({ scheduled_date: 1 });

const EmailCampaign = mongoose.model("EmailCampaign", emailCampaignSchema);

module.exports = EmailCampaign;
