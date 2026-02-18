const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    signatures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    officialResponse: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", petitionSchema);
