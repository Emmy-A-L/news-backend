
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// Get all articles with filters
router.get('/', async (req, res) => {
  try {
    const { category, source, search, limit = 20 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (source) query.source = source;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));
    
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get latest updates (last 1 hour)
router.get('/latest', async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const articles = await Article.find({ publishedAt: { $gte: oneHourAgo } })
      .sort({ publishedAt: -1 })
      .limit(10);
    
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;