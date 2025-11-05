// microservice-subscriber/server.js
const express = require('express');
const app = express();
const subscriberRoutes = require('./routes/subscriberRoutes');

app.use(express.json());

// Routes under /subscriber (indeholder /health, /admin/toggle, CRUD)
app.use('/subscriber', subscriberRoutes);

// Simpel health / status på roden
app.get('/', (req, res) => {
  res.send('SubscriberService running 🚀');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`SubscriberService listening on http://localhost:${PORT}`);
});
