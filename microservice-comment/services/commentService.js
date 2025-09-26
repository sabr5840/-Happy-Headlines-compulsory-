// services/commentService.js
const pool = require('../db');
const axios = require('axios');

// Circuit breaker variabler
let failureCount = 0;
let circuitOpen = false;
const FAILURE_THRESHOLD = 3; // antal fejl før vi "åbner"
const RESET_TIMEOUT = 30000; // 30 sekunder

// Tilføj en ny kommentar
async function addComment(article_id, author, content) {
  let flagged = false;

  if (!circuitOpen) {
    try {
      // kald ProfanityService for at tjekke tekst
      const response = await axios.post('http://profanityservice:4000/profanity/check', {
        text: content,
      });

      console.log("📡 Response fra ProfanityService:", response.data);

      flagged = response.data.hasProfanity === true; // sikre boolean
      failureCount = 0; // nulstil tæller ved success
    } catch (err) {
      failureCount++;
      console.error('🚨 Fejl ved kald til ProfanityService:', err.message);

      if (failureCount >= FAILURE_THRESHOLD) {
        circuitOpen = true;
        console.warn('⚡ Circuit breaker ÅBEN — springer ProfanityService over i 30 sekunder');
        setTimeout(() => {
          circuitOpen = false;
          failureCount = 0;
          console.log('🔄 Circuit breaker LUKKET igen, prøver ProfanityService');
        }, RESET_TIMEOUT);
      }

      // fallback: vi gemmer kommentaren som ikke-flagged
      flagged = false;
    }
  } else {
    console.log('⚡ Circuit breaker aktiv: springer ProfanityService over');
    flagged = false;
  }

  const result = await pool.query(
    `INSERT INTO comments (article_id, author, content, flagged)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [article_id, author, content, flagged]
  );

  return result.rows[0];
}

// Hent alle kommentarer
async function getAllComments() {
  const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
  return result.rows;
}

// Hent kommentarer for et bestemt article_id
async function getCommentsByArticle(article_id) {
  const result = await pool.query(
    'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC',
    [article_id]
  );
  return result.rows;
}

// Slet en kommentar
async function deleteComment(id) {
  const result = await pool.query(
    'DELETE FROM comments WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0]; // returnerer den slettede række eller undefined
}

module.exports = {
  addComment,
  getAllComments,
  getCommentsByArticle,
  deleteComment,
};
