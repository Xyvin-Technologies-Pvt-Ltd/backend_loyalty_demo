const mongoose = require("mongoose");

const admin_schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    status: {
      type: Boolean,
      default: true,
    },
    password: { type: String, trim: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", admin_schema);

module.exports = Admin;
