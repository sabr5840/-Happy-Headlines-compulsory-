const express = require('express');
const app = express();

app.use(express.json());

// importer ArticleService
const articleRoutes = require('./routes/articleRoutes');
app.use('/articles', articleRoutes);

app.get('/', (req, res) => {
  res.send('HappyHeadlines API running 🚀');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
