// routes/draftRoutes.js
const express = require('express');
const router = express.Router();
const draftService = require('../services/draftService');
const logger = require('../logger');

// GET: Hent alle drafts
router.get('/', async (req, res) => {
  try {
    const drafts = await draftService.getAllDrafts();
    logger.info('Fetched all drafts', { count: drafts.length });
    res.json(drafts);
  } catch (err) {
    logger.error('GET /drafts failed', { error: err.message });
    res.status(500).json({ error: 'Kunne ikke hente drafts' });
  }
});

// GET: Hent et draft efter ID
router.get('/:id', async (req, res) => {
  try {
    const draft = await draftService.getDraftById(req.params.id);
    if (!draft) {
      logger.warn('Draft not found', { draftId: req.params.id });
      return res.status(404).json({ error: 'Draft ikke fundet' });
    }
    logger.info('Fetched draft by id', { draftId: draft.id });
    res.json(draft);
  } catch (err) {
    logger.error('GET /drafts/:id failed', { error: err.message });
    res.status(500).json({ error: 'Kunne ikke hente draft' });
  }
});

// POST: Opret et nyt draft
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      logger.warn('Draft creation failed - missing fields', { body: req.body });
      return res.status(400).json({ error: 'title, content og author er påkrævet' });
    }

    const newDraft = await draftService.createDraft(title, content, author);
    logger.info('Draft created via API', { draftId: newDraft.id, author });
    res.status(201).json(newDraft);
  } catch (err) {
    logger.error('POST /drafts failed', { error: err.message });
    res.status(500).json({ error: 'Kunne ikke oprette draft' });
  }
});

// PUT: Opdater et draft
router.put('/:id', async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const updatedDraft = await draftService.updateDraft(
      req.params.id,
      title,
      content,
      status
    );

    if (!updatedDraft) {
      logger.warn('Draft update failed - not found', { draftId: req.params.id });
      return res.status(404).json({ error: 'Draft ikke fundet' });
    }

    logger.info('Draft updated', { draftId: updatedDraft.id, status: updatedDraft.status });
    res.json(updatedDraft);
  } catch (err) {
    logger.error('PUT /drafts/:id failed', { error: err.message });
    res.status(500).json({ error: 'Kunne ikke opdatere draft' });
  }
});

// DELETE: Slet et draft
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await draftService.deleteDraft(req.params.id);

    if (!deleted) {
      logger.warn('Draft delete failed - not found', { draftId: req.params.id });
      return res.status(404).json({ error: 'Draft ikke fundet' });
    }

    logger.info('Draft deleted', { draftId: req.params.id });
    res.json({ message: 'Draft slettet' });
  } catch (err) {
    logger.error('DELETE /drafts/:id failed', { error: err.message });
    res.status(500).json({ error: 'Kunne ikke slette draft' });
  }
});

module.exports = router;
