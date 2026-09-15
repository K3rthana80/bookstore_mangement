require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const { initDb } = require('./src/config/db');

const authRoutes      = require('./src/routes/authRoutes');
const bookRoutes      = require('./src/routes/bookRoutes');
const issueRoutes     = require('./src/routes/issueRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/books',     bookRoutes);
app.use('/api/issues',    issueRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Book Store API is running.' }));

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Global error handler (catches async errors via express-async-errors)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Something went wrong. Please try again.' });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`\n📚  Book Store API  →  http://localhost:${PORT}`);
    console.log(`🔑  Default login   →  admin / admin123\n`);
  });
};

start().catch(err => { console.error('Startup error:', err); process.exit(1); });

module.exports = app;
