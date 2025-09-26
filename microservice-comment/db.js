// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'happy_user',
  password: process.env.DB_PASSWORD || 'secretpassword',
  host: 'comment_db',
  database: 'happyheadlines_comments',
  port: 5432,
});

module.exports = pool;
