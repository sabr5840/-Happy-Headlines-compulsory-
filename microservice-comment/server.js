// server.js
const express = require('express');
const app = express();
const commentRoutes = require('./routes/commentRoutes');

app.use(express.json());

// Routes
app.use('/', commentRoutes);

app.get('/', (req, res) => {
  res.send('CommentService running 🚀');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CommentService running on http://localhost:${PORT}`);
});
