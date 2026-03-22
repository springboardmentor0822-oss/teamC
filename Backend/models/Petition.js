const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Infrastructure", "Health", "Education", "Environment", "Other"],
    },

    description: {
      type: String,
      required: true,
    },

    signatureGoal: {
      type: Number,
      default: 100,
    },

    location: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "under_review", "approved", "rejected", "closed"],
      default: "active",
    },

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

    responses: [
      {
        official: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        message: {
          type: String,
          required: true,
        },

        statusUpdate: {
          type: String,
          enum: ["under_review", "approved", "rejected", "closed"],
        },

        respondedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", petitionSchema);