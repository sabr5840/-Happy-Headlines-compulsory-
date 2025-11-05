// microservice-subscriber/db.js
const { Pool } = require('pg');

const pool = new Pool({
    user:     process.env.DB_USER || 'happy_user',
    password: process.env.DB_PASSWORD || 'secretpassword',
    host:     process.env.DB_HOST || 'subscriber_db',
    database: process.env.DB_NAME || 'happyheadlines_subscribers',
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
