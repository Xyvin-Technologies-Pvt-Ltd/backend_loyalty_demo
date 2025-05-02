const mongoose = require("mongoose");

const triggerServicesSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true, unique: true },
      ar: { type: String },
    },
    icon: {
      type: String,
      required: true,
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String },
    },
    triggerEvent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TriggerEvent",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const TriggerServices = mongoose.model(
  "TriggerServices",
  triggerServicesSchema
);

module.exports = TriggerServices;
