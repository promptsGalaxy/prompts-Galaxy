const mongoose = require("mongoose");

const PromptSchema = new mongoose.Schema(
  {
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

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Prompt", PromptSchema);
