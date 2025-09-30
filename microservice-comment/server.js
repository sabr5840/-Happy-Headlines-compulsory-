// microservice-comment/server.js
const express = require('express');
const app = express();
const commentRoutes = require('./routes/commentRoutes');
const { getMetrics } = require('./metrics');

app.use(express.json());

// Routes
app.use('/', commentRoutes);

// Metrics
app.get('/metrics', (req, res) => {
  res.json(getMetrics());
});

app.get('/', (req, res) => {
  res.send('CommentService running 🚀');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CommentService running on http://localhost:${PORT}`);
});
