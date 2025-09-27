// services/draftService.js
const pool = require('../db');
const logger = require('../logger');

// Hent alle drafts
async function getAllDrafts() {
  try {
    const result = await pool.query('SELECT * FROM drafts ORDER BY created_at DESC');
    return result.rows;
  } catch (err) {
    logger.error('Database error in getAllDrafts', { error: err.message });
    throw err;
  }
}

// Hent et draft efter ID
async function getDraftById(id) {
  try {
    const result = await pool.query('SELECT * FROM drafts WHERE id = $1', [id]);
    return result.rows[0];
  } catch (err) {
    logger.error('Database error in getDraftById', { draftId: id, error: err.message });
    throw err;
  }
}

// Opret et nyt draft
async function createDraft(title, content, author) {
  try {
    const result = await pool.query(
      `INSERT INTO drafts (title, content, author) VALUES ($1, $2, $3) RETURNING *`,
      [title, content, author]
    );
    logger.info('Draft created in DB', { draftId: result.rows[0].id });
    return result.rows[0];
  } catch (err) {
    logger.error('Database error in createDraft', { error: err.message });
    throw err;
  }
}

// Opdater et draft
async function updateDraft(id, title, content, status) {
  try {
    const result = await pool.query(
      `UPDATE drafts SET title = $1, content = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, content, status, id]
    );
    return result.rows[0];
  } catch (err) {
    logger.error('Database error in updateDraft', { draftId: id, error: err.message });
    throw err;
  }
}

// Slet et draft
async function deleteDraft(id) {
  try {
    const result = await pool.query(
      'DELETE FROM drafts WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (err) {
    logger.error('Database error in deleteDraft', { draftId: id, error: err.message });
    throw err;
  }
}

module.exports = {
  getAllDrafts,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
};
