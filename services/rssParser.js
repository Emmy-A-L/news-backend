const Parser = require('rss-parser');
const parser = new Parser();
const axios = require('axios');
const cheerio = require('cheerio');

// News sources configuration
const newsSources = [
  {
    name: 'BBC',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    categories: ['world'],
    contentSelector: 'div[property="articleBody"]'
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    categories: ['world'],
    contentSelector: 'article__main'
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    categories: ['world'],
    contentSelector: '.wysiwyg'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    categories: ['technology'],
    contentSelector: '.article-content'
  }
];

// Function to extract article content
async function extractArticleContent(url, selector) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    let content = '';
    
    // Try the specified selector
    if (selector) {
      content = $(selector).html();
    }
    
    // Fallback to common content selectors
    if (!content) {
      const fallbackSelectors = [
        'article', 
        '.article-body', 
        '.post-content',
        '.entry-content',
        '.article-content',
        '.content'
      ];
      
      for (const sel of fallbackSelectors) {
        content = $(sel).html();
        if (content) break;
      }
    }
    
    // Final fallback to body content
    if (!content) {
      content = $('body').html();
    }
    
    // Clean up content
    if (content) {
      // Remove unnecessary elements
      const $content = cheerio.load(content);
      $content('script, style, iframe, noscript, .ad, .ads, .advertisement').remove();
      
      // Convert relative URLs to absolute
      $content('a, img').each((i, el) => {
        const $el = $content(el);
        const src = $el.attr('src') || $el.attr('href');
        if (src && !src.startsWith('http')) {
          const urlObj = new URL(url);
          $el.attr('src' in el ? 'src' : 'href', `${urlObj.origin}${src}`);
        }
      });
      
      return $content.html();
    }
    
    return null;
  } catch (err) {
    console.error(`Error fetching content from ${url}:`, err.message);
    return null;
  }
}

// Parse RSS feeds and extract content
async function parseRSSFeeds() {
  const articles = [];
  
  for (const source of newsSources) {
    try {
      const feed = await parser.parseURL(source.url);
      
      for (const item of feed.items.slice(0, 10)) { // Limit to 10 articles per source
        try {
          const content = await extractArticleContent(item.link, source.contentSelector);
          
          if (content) {
            articles.push({
              title: item.title || '',
              description: item.contentSnippet || '',
              content: content,
              url: item.link,
              image: item.enclosure?.url || null,
              source: source.name.toLowerCase(),
              sourceName: source.name,
              category: source.categories[0] || 'general',
              publishedAt: new Date(item.pubDate || Date.now())
            });
          }
        } catch (err) {
          console.error(`Error processing article: ${item.link}`, err);
        }
      }
    } catch (err) {
      console.error(`Error parsing RSS feed: ${source.url}`, err);
    }
  }
  
  return articles;
}

module.exports = parseRSSFeeds;