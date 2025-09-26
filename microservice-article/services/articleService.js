const { getPool } = require('../db'); // brug getPool fra db.js

// Hent alle artikler fra en bestemt region
async function getArticles(region) {
  const pool = getPool(region);
  const result = await pool.query(
    'SELECT * FROM articles ORDER BY created_at DESC'
  );
  return result.rows;
}

// Hent én artikel fra en bestemt region
async function getArticleById(region, id) {
  const pool = getPool(region);
  const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
  return result.rows[0];
}

// Opret artikel i den database der matcher region
async function createArticle(title, content, region) {
  const pool = getPool(region);
  const result = await pool.query(
    'INSERT INTO articles (title, content, region) VALUES ($1, $2, $3) RETURNING *',
    [title, content, region]
  );
  return result.rows[0];
}

// Opdater artikel i en bestemt region
async function updateArticle(region, id, title, content) {
  const pool = getPool(region);
  const result = await pool.query(
    'UPDATE articles SET title = $1, content = $2 WHERE id = $3 RETURNING *',
    [title, content, id]
  );
  return result.rows[0];
}

// Slet artikel i en bestemt region
async function deleteArticle(region, id) {
  const pool = getPool(region);
  const result = await pool.query(
    'DELETE FROM articles WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
