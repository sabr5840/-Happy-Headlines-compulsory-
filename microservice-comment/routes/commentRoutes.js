// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const {
  addComment,
  getAllComments,
  getCommentsByArticle,
  deleteComment
} = require('../services/commentService');

// POST: Tilføj en kommentar
router.post('/comments', async (req, res) => {
  try {
    const { article_id, author, content } = req.body;

    if (!article_id || !author || !content) {
      return res.status(400).json({ error: 'article_id, author og content er påkrævet' });
    }

    const newComment = await addComment(article_id, author, content);
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke gemme kommentaren' });
  }
});

// GET: Hent alle kommentarer
router.get('/comments', async (req, res) => {
  try {
    const comments = await getAllComments();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke hente kommentarer' });
  }
});

// GET: Hent kommentarer for en specifik artikel
router.get('/comments/article/:article_id', async (req, res) => {
  try {
    const { article_id } = req.params;
    const comments = await getCommentsByArticle(article_id);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke hente kommentarer for denne artikel' });
  }
});

// DELETE: Slet en kommentar
router.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteComment(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Kommentar ikke fundet' });
    }

    res.json({ message: 'Kommentar slettet' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke slette kommentaren' });
  }
});

module.exports = router;
