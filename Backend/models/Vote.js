const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({

  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll"
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  selectedOption: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Vote", voteSchema);