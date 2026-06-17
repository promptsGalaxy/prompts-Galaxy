const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  Category: Array,
  mediaType: String,
  mediaUrl: String,
  Prompt: String,
  Prompt2: String,
  description: String,
  views: Number,
});

module.exports = mongoose.model("Click", clickSchema, "click");
