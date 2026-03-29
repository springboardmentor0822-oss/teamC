const mongoose = require("mongoose");

const officialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },

  image: { type: String }, // image URL

  contact: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Official", officialSchema);