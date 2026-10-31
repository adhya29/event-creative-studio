const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

module.exports = {
  requireAdmin(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required. Missing Bearer token.',
        });
      }

      const token = authHeader.split(' ')[1];

      // 1. Check custom JWT
      try {
        const decoded = jwt.verify(token, config.admin.jwtSecret);
        req.admin = decoded;
        return next();
      } catch (jwtErr) {
        // Not custom JWT, maybe Supabase token or fallback token
      }

      // 2. Check if Supabase client can verify token
      const supabase = db.getSupabaseClient();
      if (supabase) {
        supabase.auth.getUser(token).then(({ data: { user }, error }) => {
          if (!error && user) {
            req.admin = { id: user.id, email: user.email, role: 'admin' };
            return next();
          } else {
            return res.status(401).json({
              success: false,
              error: 'Invalid or expired authentication session.',
            });
          }
        }).catch(() => {
          return res.status(401).json({
            success: false,
            error: 'Authentication failed.',
          });
        });
        return;
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid or expired administrator token.',
      });
    } catch (err) {
      console.error('Auth middleware error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error in authorization' });
    }
  },
};
