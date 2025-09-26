const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'happy_user',
  password: process.env.DB_PASSWORD || 'secretpassword',
  host: process.env.DB_HOST || 'draft_db',
  database: process.env.DB_NAME || 'happyheadlines_drafts',
  port: 5432,
});

module.exports = pool;
