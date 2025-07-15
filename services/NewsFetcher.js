// server/services/newsFetcher.js
const parseRSSFeed = require("./rssParser");
const Article = require("../models/Article");

async function getExistingArticles() {
  try {
    return await Article.find({}).sort({ publishedAt: -1 }).limit(80); // Adjust limit as needed
  } catch (err) {
    console.error("Error fetching existing articles:", err);
    return [];
  }
}

async function fetchAndStoreNews() {
  // First, get existing articles
  const existingArticles = await getExistingArticles();

  // Start fetching new articles in the background
  (async () => {
    try {
      const articles = await parseRSSFeed();
      let newArticlesCount = 0;

      for (const article of articles) {
        try {
          // Check if article already exists
          const existingArticle = await Article.findOne({ url: article.url });

          if (!existingArticle) {
            const newArticle = new Article(article);
            await newArticle.save();
            newArticlesCount++;
          }
        } catch (err) {
          console.error("Error saving article:", err);
        }
      }

      console.log(`Stored ${newArticlesCount} new articles`);
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  })();

  // Return existing articles immediately
  return existingArticles;
}

module.exports = fetchAndStoreNews;
