// server/models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  image: { type: String },
  source: { type: String, required: true },
  sourceName: { type: String, required: true },
  category: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);