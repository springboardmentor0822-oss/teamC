const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: String,

  options: [
    {
      text: String,
      votes: {
        type: Number,
        default: 0
      }
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  targetLocation: String,

  expiresAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Poll", pollSchema);