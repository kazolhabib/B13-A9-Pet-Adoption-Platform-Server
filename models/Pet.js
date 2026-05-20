const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    imageUrl: { type: String, required: true },
    healthStatus: { type: String, default: "Unknown" },
    vaccinationStatus: { type: String, default: "Unknown" },
    location: { type: String, required: true },
    adoptionFee: { type: Number, default: 0 },
    description: { type: String, default: "" },
    ownerEmail: { type: String, required: true },
    status: { type: String, enum: ["available", "adopted"], default: "available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
