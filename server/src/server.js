const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./db');

// Run centralized configuration validation at startup
try {
  config.validateConfig();
} catch (err) {
  console.error(`\n❌ [STARTUP CONFIG ERROR]\n${err.message}\n`);
  process.exit(1);
}

const app = express();

// Security headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Production-hardened CORS configuration
const allowedDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  config.frontendUrl,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server health checks, automated tests)
    if (!origin) {
      return callback(null, true);
    }

    if (!config.isProduction) {
      if (allowedDevOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true);
    }

    // Production: strictly enforce approved origins (configured FRONTEND_URL or Vercel deployment)
    const isConfiguredOrigin = config.frontendUrl && origin === config.frontendUrl;
    const isVercelDomain = /^https:\/\/[a-z0-9-]+(\.vercel\.app)$/i.test(origin);

    if (isConfiguredOrigin || isVercelDomain) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Middleware: JSON and URL-encoded body parsers with safety limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving (development only)
if (!config.isProduction) {
  app.use('/uploads', express.static(config.uploadsDir));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Event Photography & Creative Services Studio API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    supabaseConnected: db.isSupabaseConfigured(),
    environment: config.nodeEnv,
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
  const status = err.status || (err.message && err.message.includes('CORS') ? 403 : 500);

  // In production, do not expose internal database errors or stack traces to clients
  const safeMessage =
    config.isProduction && status === 500
      ? 'An unexpected server error occurred. Please try again later.'
      : err.message || 'An unexpected error occurred.';

  res.status(status).json({
    success: false,
    error: safeMessage,
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
  console.log(`🛡️ Environment: ${config.nodeEnv.toUpperCase()}`);
  console.log(`======================================================\n`);
});

module.exports = { app, server };
