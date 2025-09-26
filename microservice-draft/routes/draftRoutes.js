const express = require('express');
const router = express.Router();
const draftService = require('../services/draftService');

// GET alle drafts
router.get('/', async (req, res) => {
  try {
    const drafts = await draftService.getDrafts();
    res.json(drafts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke hente drafts' });
  }
});

// GET ét draft
router.get('/:id', async (req, res) => {
  try {
    const draft = await draftService.getDraftById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft ikke fundet' });
    res.json(draft);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke hente draft' });
  }
});

// POST opret draft
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'title, content og author er påkrævet' });
    }
    const newDraft = await draftService.createDraft(title, content, author);
    res.status(201).json(newDraft);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke oprette draft' });
  }
});

// PUT opdater draft
router.put('/:id', async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const updated = await draftService.updateDraft(req.params.id, title, content, status);
    if (!updated) return res.status(404).json({ error: 'Draft ikke fundet' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke opdatere draft' });
  }
});

// DELETE slet draft
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await draftService.deleteDraft(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Draft ikke fundet' });
    res.json({ message: 'Draft slettet' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke slette draft' });
  }
});

module.exports = router;
