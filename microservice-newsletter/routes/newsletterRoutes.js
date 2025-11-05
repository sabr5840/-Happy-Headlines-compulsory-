import express from 'express';
import { processWelcomeQueue, fetchActiveSubscribersWithCB } from '../services/newsletterService.js';

const router = express.Router();

// Manuelt tøm køen (velkomst)
router.post('/process-welcomes', async (_req, res) => {
  let processed = 0;
  while (await processWelcomeQueue()) processed++;
  res.json({ processed });
});

// Daglig udsendelse – henter aktive via REST (med CB)
router.post('/send-daily', async (_req, res) => {
  const list = await fetchActiveSubscribersWithCB();
  // her kunne du også hente artikler fra ArticleService
  list.forEach(s => console.log(`[NEWSLETTER] daily newsletter -> ${s.email}`));
  res.json({ recipients: list.length });
});

export default router;
