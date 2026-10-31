const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const nodeEnv = (process.env.NODE_ENV || 'development').trim().toLowerCase();
const isProduction = nodeEnv === 'production';

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const supabaseStorageBucket = (process.env.SUPABASE_STORAGE_BUCKET || 'studio-media').trim();

// Centralized configuration validation
function validateConfig() {
  if (isProduction) {
    const missing = [];
    if (!supabaseUrl) {
      missing.push('SUPABASE_URL');
    } else if (!supabaseUrl.startsWith('https://')) {
      missing.push('SUPABASE_URL (must begin with https://)');
    }

    if (!supabaseServiceRoleKey) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY (backend privileged database key)');
    }

    if (missing.length > 0) {
      const err = new Error(
        `[CONFIG ERROR] Production mode requires valid Supabase credentials:\n- ` +
          missing.join('\n- ') +
          `\nThe local JSON database fallback is NOT permitted in production.`
      );
      err.code = 'CONFIG_VALIDATION_FAILED';
      throw err;
    }
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  isProduction,
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/$/, ''),
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceRoleKey,
    storageBucket: supabaseStorageBucket,
  },
  admin: {
    jwtSecret: process.env.ADMIN_JWT_SECRET || 'lumina-studio-secret-key-super-secure-2026',
    email: (process.env.ADMIN_EMAIL || 'admin@luminacreative.studio').trim().toLowerCase(),
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminStudio@2026',
  },
  uploadsDir: path.join(__dirname, '../../uploads'),
  validateConfig,
};
