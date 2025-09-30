// microservice-comment/services/commentService.js
const pool = require('../db');
const axios = require('axios');
const { getComments, setComments, invalidate } = require('../cache');

// Circuit breaker
let failureCount = 0;
let circuitOpen = false;
const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT = 30000;

// Tilføj en ny kommentar
async function addComment(article_id, author, content) {
  let flagged = false;

  if (!circuitOpen) {
    try {
      const response = await axios.post('http://profanityservice:4000/profanity/check', {
        text: content,
      });
      flagged = response.data.hasProfanity === true;
      failureCount = 0;
    } catch (err) {
      failureCount++;
      if (failureCount >= FAILURE_THRESHOLD) {
        circuitOpen = true;
        setTimeout(() => { circuitOpen = false; failureCount = 0; }, RESET_TIMEOUT);
      }
      flagged = false; // fallback
    }
  }

  const result = await pool.query(
      `INSERT INTO comments (article_id, author, content, flagged)
       VALUES ($1, $2, $3, $4)
         RETURNING *`,
      [article_id, author, content, flagged]
  );

  // invalider cache for dette article_id (nemt og sikkert)
  invalidate(article_id);

  return result.rows[0];
}

// Hent alle kommentarer (typisk ikke cachet – behold som DB-kald)
async function getAllComments() {
  const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
  return result.rows;
}

// Hent kommentarer for et bestemt article_id (cache-miss approach + LRU)
async function getCommentsByArticle(article_id) {
  const cached = getComments(article_id);
  if (cached) return cached;

  const result = await pool.query(
      'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC',
      [article_id]
  );

  setComments(article_id, result.rows);
  return result.rows;
}

// Slet en kommentar
async function deleteComment(id) {
  // find article_id for at kunne invaliderere den rigtige liste
  const res = await pool.query('SELECT article_id FROM comments WHERE id = $1', [id]);
  const row = res.rows[0];

  const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [id]
  );

  if (row) invalidate(row.article_id);

  return result.rows[0];
}

module.exports = {
  addComment,
  getAllComments,
  getCommentsByArticle,
  deleteComment,
};
