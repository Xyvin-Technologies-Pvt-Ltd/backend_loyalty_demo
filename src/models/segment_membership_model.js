const mongoose = require("mongoose");

const segmentMembershipSchema = new mongoose.Schema(
  {
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerSegment",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
    // Additional data about why this customer is in this segment
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a customer is only in a segment once
segmentMembershipSchema.index({ segment: 1, customer: 1 }, { unique: true });
// Index for faster lookups by segment
segmentMembershipSchema.index({ segment: 1 });
// Index for faster lookups by customer
segmentMembershipSchema.index({ customer: 1 });

const SegmentMembership = mongoose.model(
  "SegmentMembership",
  segmentMembershipSchema
);

module.exports = SegmentMembership;
