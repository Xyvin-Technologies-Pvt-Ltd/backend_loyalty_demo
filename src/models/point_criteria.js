const mongoose = require("mongoose");

const point_criteria_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    type: { type: String, trim: true }, //? service, utility, charity, government, insurance
    point: { type: Number, trim: true },
    amount: { type: Number, trim: true },
    currency: { type: String, trim: true, default: "OMR" },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Criteria = mongoose.model("Criteria", point_criteria_schema);

module.exports = Criteria;
