const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  title: String,

  imageUrl: String,

  redirectUrl: String,

  advertiser: String,

  views: {
    type: Number,
    default: 0,
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 1,
  },

  clicks: {
    type: Number,
    default: 0,
  },

  active: {
    type: Boolean,
    default: true,
  },
  btn: String,
  badge: String,

  startDate: Date,

  endDate: Date,
});

module.exports = mongoose.model("Ad", adSchema);
