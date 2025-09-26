const express = require('express');
const router = express.Router();
const articleService = require('../services/articleService');


// Hent alle artikler for en region
router.get('/:region', async (req, res) => {
  try {
    const articles = await articleService.getArticles(req.params.region);
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Hent én artikel fra en region
router.get('/:region/:id', async (req, res) => {
  try {
    const article = await articleService.getArticleById(
      req.params.region,
      req.params.id
    );
    if (!article) {
      return res.status(404).send('Article not found');
    }
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Opret en artikel i en region
router.post('/:region', async (req, res) => {
  try {
    const { title, content } = req.body;
    const newArticle = await articleService.createArticle(
      title,
      content,
      req.params.region
    );
    res.status(201).json(newArticle);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Opdater en artikel i en region
router.put('/:region/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedArticle = await articleService.updateArticle(
      req.params.region,
      req.params.id,
      title,
      content
    );
    if (!updatedArticle) {
      return res.status(404).send('Article not found');
    }
    res.json(updatedArticle);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Slet en artikel i en region
router.delete('/:region/:id', async (req, res) => {
  try {
    const deletedArticle = await articleService.deleteArticle(
      req.params.region,
      req.params.id
    );
    if (!deletedArticle) {
      return res.status(404).send('Article not found');
    }
    res.json(deletedArticle);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
