const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/auth', authRoutes);
  app.use('/documents', documentRoutes);

  // Fallback error handler so unexpected errors return JSON, not HTML.
  app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large (max 5MB)' });
    }
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
