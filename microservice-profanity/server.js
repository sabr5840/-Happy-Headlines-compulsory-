// server.js
const express = require('express');
const app = express();
const profanityRoutes = require('./routes/profanityRoutes');

app.use(express.json());
app.use('/profanity', profanityRoutes);

app.get('/', (req, res) => {
  res.send('Profanity Service running 🚀');
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`ProfanityService running on http://localhost:${PORT}`);
});
