// routes/profanityRoutes.js
const express = require('express');
const router = express.Router();
const { checkProfanity } = require('../services/profanityService');

// POST /check
router.post('/check', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await checkProfanity(text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
