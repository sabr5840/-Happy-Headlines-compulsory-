// services/subscriberService.js
const db = require('../db');
const { enqueueWelcome } = require('../queue'); // <-- NY

// Hjælpefunktion: skriv til queue (DB + Redis), men lad ikke fejl vælte requesten
async function enqueue(subscriber, action) {
  try {
    // 1) DB-queue (hvis du vil beholde audit)
    await db.query(
      'INSERT INTO subscriber_queue (subscriber_id, action) VALUES ($1, $2)',
      [subscriber.id, action]
    );
  } catch (err) {
    console.error('Failed to enqueue to DB queue', err);
    // Fault isolation: subscription lykkes stadig
  }

  try {
    // 2) Redis-queue (det NewsletterService faktisk lytter på)
    await enqueueWelcome({
      id: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      action
    });
  } catch (err) {
    console.error('Failed to enqueue to Redis', err);
    // Fault isolation: subscription lykkes stadig
  }
}

async function createSubscriber(name, email) {
  const result = await db.query(
    'INSERT INTO subscribers (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  const subscriber = result.rows[0];

  await enqueue(subscriber, 'subscribe');

  return subscriber;
}

async function removeSubscriber(id) {
  // hent data først så vi kan sende email i Redis-queue
  const lookup = await db.query('SELECT id, name, email FROM subscribers WHERE id = $1', [id]);
  const existing = lookup.rows[0];

  // læg en unsubscribe i queue (DB+Redis)
  if (existing) {
    await enqueue(existing, 'unsubscribe');
  }

  const result = await db.query(
    'DELETE FROM subscribers WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

async function listSubscribers() {
  const result = await db.query(
    'SELECT id, name, email, created_at FROM subscribers ORDER BY created_at DESC'
  );
  return result.rows;
}

module.exports = {
  createSubscriber,
  removeSubscriber,
  listSubscribers,
};
