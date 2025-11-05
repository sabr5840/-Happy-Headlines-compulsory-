// routes/subscriberRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSubscriber,
  removeSubscriber,
  listSubscribers,
} = require('../services/subscriberService');
const { isEnabled, setEnabled } = require('../toggle');

// middleware: skrivende endpoints kræver at togglen er ON
function requireEnabled(req, res, next) {
  if (!isEnabled()) return res.status(503).json({ error: 'SubscriberService is disabled' });
  next();
}

// GET /subscriber/health
router.get('/health', (req, res) => {
  res.json({ ok: true, enabled: isEnabled() });
});

// POST /subscriber/admin/toggle  { enable: "on" | "off" } (header: x-admin-token)
router.post('/admin/toggle', (req, res) => {
  const token = req.header('x-admin-token');
  if (token !== (process.env.ADMIN_TOKEN || 'supersecret-admin')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const enable = String((req.body && req.body.enable) || '').toLowerCase();
  if (!['on', 'off', 'true', 'false', '1', '0'].includes(enable)) {
    return res.status(400).json({ error: 'enable should be on/off' });
  }
  setEnabled(enable === 'on' || enable === 'true' || enable === '1');
  res.json({ enabled: isEnabled() });
});

// LIST – åben (partial off)
router.get('/', async (req, res, next) => {
  try {
    const subscribers = await listSubscribers();
    res.json(subscribers);
  } catch (err) { next(err); }
});

// CREATE – kræver toggle ON
router.post('/', requireEnabled, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    const subscriber = await createSubscriber(name, email);
    res.status(201).json(subscriber);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already subscribed' });
    next(err);
  }
});

// DELETE – kræver toggle ON
router.delete('/:id', requireEnabled, async (req, res, next) => {
  try {
    const removed = await removeSubscriber(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Subscriber not found' });
    res.json(removed);
  } catch (err) { next(err); }
});

module.exports = router;
