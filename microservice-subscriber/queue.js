// microservice-subscriber/queue.js
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const QUEUE_KEY = 'subscriber_queue'; // samme key som NewsletterService forventer

async function enqueueWelcome(payload) {
  // payload: { id, name, email, action }
  await redis.lpush(QUEUE_KEY, JSON.stringify(payload));
}

module.exports = { enqueueWelcome };
