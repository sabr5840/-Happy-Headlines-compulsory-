// services/subscriberService.js
const db = require('../db');

// Hjælpefunktion: skriv til queue, men lad ikke fejl vælte requesten
async function enqueue(subscriberId, action) {
    try {
        await db.query(
            'INSERT INTO subscriber_queue (subscriber_id, action) VALUES ($1, $2)',
            [subscriberId, action]
        );
    } catch (err) {
        console.error('Failed to enqueue subscriber action', err);
        // Fault isolation: vi logger bare – subscription lykkes stadig
    }
}

async function createSubscriber(name, email) {
    const result = await db.query(
        'INSERT INTO subscribers (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
    );
    const subscriber = result.rows[0];

    // Læg besked på queue til NewsletterService
    await enqueue(subscriber.id, 'subscribe');

    return subscriber;
}

async function removeSubscriber(id) {
    // læg en unsubscribe i queue først (så NewsletterService kan reagere)
    await enqueue(id, 'unsubscribe');

    const result = await db.query(
        'DELETE FROM subscribers WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0]; // kan være undefined hvis id ikke findes
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
