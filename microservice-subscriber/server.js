// microservice-subscriber/server.js
const express = require('express');
const app = express();
const subscriberRoutes = require('./routes/subscriberRoutes');

app.use(express.json());

// Release toggle – hvis SUBSCRIBER_ENABLED = "false", slår vi servicen fra
const SUBSCRIBER_ENABLED =
    process.env.SUBSCRIBER_ENABLED !== 'false';

if (SUBSCRIBER_ENABLED) {
    app.use('/subscriber', subscriberRoutes);
} else {
    // Alt på /subscriber svarer 503
    app.use('/subscriber', (req, res) => {
        res
            .status(503)
            .json({ error: 'SubscriberService is disabled via feature toggle' });
    });
}

// Simpel health / status
app.get('/', (req, res) => {
    res.send('SubscriberService running 🚀');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`SubscriberService listening on http://localhost:${PORT}`);
});
