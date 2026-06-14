const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  Category: {
    type: [String],
    required: true,
    validate: [(val) => val.length > 0, "Select at least one category"],
  },

  mediaType: String,
  mediaUrl: String,
  Prompt: String,
  Prompt2: String,
  description: String,

  views: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Prompt", ContactSchema);
