// routes/subscriberRoutes.js
const express = require('express');
const router = express.Router();
const {
    createSubscriber,
    removeSubscriber,
    listSubscribers,
} = require('../services/subscriberService');

// GET /subscriber/  -> liste alle
router.get('/', async (req, res, next) => {
    try {
        const subscribers = await listSubscribers();
        res.json(subscribers);
    } catch (err) {
        next(err);
    }
});

// POST /subscriber/  -> tilmeld
// body: { "name": "...", "email": "..." }
router.post('/', async (req, res, next) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'name and email are required' });
        }

        const subscriber = await createSubscriber(name, email);
        res.status(201).json(subscriber);
    } catch (err) {
        // fx unik email-fejl
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already subscribed' });
        }
        next(err);
    }
});

// DELETE /subscriber/:id  -> afmeld
router.delete('/:id', async (req, res, next) => {
    try {
        const removed = await removeSubscriber(req.params.id);
        if (!removed) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }
        res.json(removed);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
