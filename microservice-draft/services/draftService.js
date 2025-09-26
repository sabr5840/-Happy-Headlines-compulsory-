const pool = require('../db');

// Hent alle drafts
async function getDrafts() {
  const result = await pool.query('SELECT * FROM drafts ORDER BY created_at DESC');
  return result.rows;
}

// Hent ét draft
async function getDraftById(id) {
  const result = await pool.query('SELECT * FROM drafts WHERE id = $1', [id]);
  return result.rows[0];
}

// Opret draft
async function createDraft(title, content, author) {
  const result = await pool.query(
    `INSERT INTO drafts (title, content, author) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [title, content, author]
  );
  return result.rows[0];
}

// Opdater draft
async function updateDraft(id, title, content, status) {
  const result = await pool.query(
    `UPDATE drafts 
     SET title = $1, content = $2, status = $3, updated_at = NOW()
     WHERE id = $4 
     RETURNING *`,
    [title, content, status, id]
  );
  return result.rows[0];
}

// Slet draft
async function deleteDraft(id) {
  const result = await pool.query(
    'DELETE FROM drafts WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getDrafts,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
};
