const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./db');

const app = express();

// Production safety: Require Supabase credentials in production mode
if (config.nodeEnv === 'production' && !db.isSupabaseConfigured()) {
  console.error('\n❌ FATAL: Production mode requires valid Supabase credentials.');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  console.error('   The local JSON fallback store is NOT permitted in production.\n');
  process.exit(1);
}

// Middleware: Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development ports, Vercel previews, or missing origin (curl/mobile/Postman)
      callback(null, true);
    },
    credentials: true,
  })
);

// Middleware: JSON and URL-encoded body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads serving
app.use('/uploads', express.static(config.uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Event Photography & Creative Services Studio API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    supabaseConnected: db.isSupabaseConfigured(),
  });
});

// Mount modular REST routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/services', require('./routes/services.routes'));
app.use('/api/portfolio', require('./routes/portfolio.routes'));
app.use('/api/enquiries', require('./routes/enquiries.routes'));
app.use('/api/quotations', require('./routes/quotations.routes'));
app.use('/api/content', require('./routes/content.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/admin', require('./routes/stats.routes'));

// Centralized 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.originalUrl}' not found.`,
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.',
  });
});

// Start Express Server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 STUDIO EXPRESS BACKEND ACTIVE`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: ${db.isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local Persistent Engine'}`);
  console.log(`📁 Uploads Directory: ${config.uploadsDir}`);
  console.log(`======================================================\n`);
});

module.exports = { app, server };
