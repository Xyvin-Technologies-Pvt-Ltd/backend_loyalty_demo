const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["marketing", "transactional", "automated"],
      default: "marketing",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
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
emailTemplateSchema.index({ name: 1 }, { unique: true });
emailTemplateSchema.index({ type: 1 });
emailTemplateSchema.index({ status: 1 });

const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);

module.exports = EmailTemplate;
