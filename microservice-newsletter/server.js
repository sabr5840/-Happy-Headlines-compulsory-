import './tracing.js';
import express from 'express';
import routes from './routes/newsletterRoutes.js';
import { processWelcomeQueue } from './services/newsletterService.js';

const app = express();
app.use(express.json());
app.use('/', routes);

app.get('/', (_req, res) => res.send('NewsletterService running ✉️'));
app.listen(3004, () => console.log('NewsletterService on http://localhost:3004'));

// === Worker-toggle (kun ÉN worker, styret af ENV) ===
const ENABLE_WORKER = (process.env.ENABLE_WORKER || 'on').toLowerCase() === 'on';

if (ENABLE_WORKER) {
  setInterval(() => { processWelcomeQueue().catch(console.error); }, 5000);
}
