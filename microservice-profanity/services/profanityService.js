// services/profanityService.js
const pool = require('../db');

// Tjek om tekst indeholder bandeord
async function checkProfanity(text) {
  const result = await pool.query('SELECT word FROM profanity_words');
  const words = result.rows.map((row) => row.word.toLowerCase());

  const textWords = text.toLowerCase().split(/\s+/);
  const found = textWords.filter((w) => words.includes(w));

  return {
    hasProfanity: found.length > 0,
    badWords: found,
  };
}

module.exports = { checkProfanity };
