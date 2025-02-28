const mongoose = require("mongoose");

const role_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: String }],
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", role_schema);

module.exports = Role;
