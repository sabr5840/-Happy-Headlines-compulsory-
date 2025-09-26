// db.js
const { Pool } = require('pg');

const dbConfig = {
  user: process.env.DB_USER || 'happy_user',
  password: process.env.DB_PASSWORD || 'secretpassword',
  port: 5432,
};

// Opret connections til alle 8 databaser
const pools = {
  europe: new Pool({
    ...dbConfig,
    host: 'db_europe',
    database: 'happyheadlines_europe',
  }),
  asia: new Pool({
    ...dbConfig,
    host: 'db_asia',
    database: 'happyheadlines_asia',
  }),
  africa: new Pool({
    ...dbConfig,
    host: 'db_africa',
    database: 'happyheadlines_africa',
  }),
  northamerica: new Pool({
    ...dbConfig,
    host: 'db_northamerica',
    database: 'happyheadlines_northamerica',
  }),
  southamerica: new Pool({
    ...dbConfig,
    host: 'db_southamerica',
    database: 'happyheadlines_southamerica',
  }),
  oceania: new Pool({
    ...dbConfig,
    host: 'db_oceania',
    database: 'happyheadlines_oceania',
  }),
  antarctica: new Pool({
    ...dbConfig,
    host: 'db_antarctica',
    database: 'happyheadlines_antarctica',
  }),
  global: new Pool({
    ...dbConfig,
    host: 'db_global',
    database: 'happyheadlines_global',
  }),
};

// Hjælpefunktion: hent pool baseret på region
function getPool(region) {
  const key = region.toLowerCase();
  if (pools[key]) {
    return pools[key];
  }
  throw new Error(`Unknown region: ${region}`);
}

module.exports = { pools, getPool };
