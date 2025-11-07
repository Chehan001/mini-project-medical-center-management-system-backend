const mongoose = require('mongoose');

const homeContentSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HomeContent', homeContentSchema);
