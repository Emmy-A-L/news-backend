// server/services/newsFetcher.js
const parseRSSFeed = require('./rssParser');
const Article = require('../models/Article');

async function fetchAndStoreNews() {
  try {
    const articles = await parseRSSFeed();
    const storedArticles = [articles];
    
    for (const article of articles) {
      try {
        // Check if article already exists
        const existingArticle = await Article.findOne({ url: article.url });
        
        if (!existingArticle) {
          const newArticle = new Article(article);
          await newArticle.save();
          storedArticles.push(newArticle);
        }
      } catch (err) {
        console.error('Error saving article:', err);
      }
    }
    
    console.log(`Stored ${storedArticles.length} new articles`);
    return storedArticles;
  } catch (err) {
    console.error('Error fetching news:', err);
    return [];
  }
}

module.exports = fetchAndStoreNews;