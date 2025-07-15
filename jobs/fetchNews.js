// server/jobs/fetchNews.js
const fetchAndStoreNews = require('../services/NewsFetcher');

async function fetchNews() {
  console.log('Starting news fetch...');
  await fetchAndStoreNews();
  console.log('News fetch completed');
}

module.exports = fetchNews;