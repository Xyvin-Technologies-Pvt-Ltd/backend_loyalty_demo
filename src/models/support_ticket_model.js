const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Points", "Redemption", "Technical", "Account", "Other"],
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "in_progress", "resolved", "closed", "reopened"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploaded_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    messages: [
      {
        sender_type: {
          type: String,
          enum: ["customer", "admin"],
          required: true,
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "messages.sender_type",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        attachments: [
          {
            filename: String,
            path: String,
            mimetype: String,
            size: Number,
          },
        ],
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    related_transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    resolution_notes: {
      type: String,
      default: "",
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    closed_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
supportTicketSchema.index({ customer: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ assigned_to: 1 });
supportTicketSchema.index({ created_at: -1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

module.exports = SupportTicket;
