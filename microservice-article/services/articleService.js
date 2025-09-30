// microservice-article/services/articleService.js
const { getPool } = require('../db');
const {
  getArticlesFromCache,
  setArticlesInCache,
  getArticleFromCache,
  setArticleInCache,
  invalidateArticle,
  preloadRecentArticlesForRegion
} = require('../cache');

// Hent alle artikler for en region (først cache, ellers DB → cache)
async function getArticles(region) {
  const cached = getArticlesFromCache(region);
  if (cached) return cached;

  const pool = getPool(region);
  const { rows } = await pool.query(
      `SELECT * FROM articles ORDER BY created_at DESC`
  );

  // læg i cache (selvom listen kan være bredere end 14 dage – preload håndterer 14-dages-snapshot)
  setArticlesInCache(region, rows);
  return rows;
}

async function getArticleById(region, id) {
  const c = getArticleFromCache(region, id);
  if (c) return c;

  const pool = getPool(region);
  const { rows } = await pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [id]
  );
  const article = rows[0];
  if (article) setArticleInCache(region, article);
  return article;
}

async function createArticle(title, content, region) {
  const pool = getPool(region);
  const { rows } = await pool.query(
      'INSERT INTO articles (title, content, region) VALUES ($1, $2, $3) RETURNING *',
      [title, content, region]
  );
  const article = rows[0];
  setArticleInCache(region, article);
  return article;
}

async function updateArticle(region, id, title, content) {
  const pool = getPool(region);
  const { rows } = await pool.query(
      'UPDATE articles SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
  );
  const article = rows[0];
  if (article) setArticleInCache(region, article);
  return article;
}

async function deleteArticle(region, id) {
  const pool = getPool(region);
  const { rows } = await pool.query(
      'DELETE FROM articles WHERE id = $1 RETURNING *',
      [id]
  );
  const deleted = rows[0];
  if (deleted) invalidateArticle(region, id);
  return deleted;
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
