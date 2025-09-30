require('./tracing');
const express = require('express');
const app = express();
const draftRoutes = require('./routes/draftRoutes');

app.use(express.json());
app.use('/drafts', draftRoutes);

app.get('/', (req, res) => {
  res.send('DraftService running 🚀');
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`DraftService running on http://localhost:${PORT}`);
});
