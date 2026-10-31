const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'studio-media',
  },
  admin: {
    jwtSecret: process.env.ADMIN_JWT_SECRET || 'lumina-studio-secret-key-super-secure-2026',
    email: process.env.ADMIN_EMAIL || 'admin@luminacreative.studio',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminStudio@2026',
  },
  uploadsDir: path.join(__dirname, '../../uploads'),
};
