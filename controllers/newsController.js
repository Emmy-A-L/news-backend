exports.getNews = async (req, res) => {
  const { source, category, search } = req.query;
  const query = {};
  if (source) query.source = source;
  if (category) query.category = category;
  if (search) query.title = new RegExp(search, 'i');
  const articles = await News.find(query).sort({ publishedAt: -1 });
  res.json(articles);
};
