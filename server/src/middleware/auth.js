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

      // 1. Check custom JWT (development/local auth only)
      // In production with Supabase configured, custom JWT path is disabled
      // to enforce UUID-bound admin authorization exclusively through Supabase Auth.
      const supabaseActive = db.isSupabaseConfigured();
      if (!supabaseActive) {
        try {
          const decoded = jwt.verify(token, config.admin.jwtSecret);
          req.admin = decoded;
          return next();
        } catch (jwtErr) {
          // Not custom JWT — fall through
        }
      }

      // 2. Check if Supabase client can verify token
      const supabase = db.getSupabaseClient();
      if (supabase) {
        supabase.auth.getUser(token).then(async ({ data, error }) => {
          if (!error && data && data.user) {
            const user = data.user;
            try {
              // Strictly verify that this user's UUID is explicitly provisioned in admins table
              const { data: adminRecord, error: adminErr } = await supabase
                .from('admins')
                .select('id, email, role, full_name, is_active')
                .eq('supabase_user_id', user.id)
                .eq('is_active', true)
                .single();

              if (!adminErr && adminRecord) {
                req.admin = {
                  id: adminRecord.id,
                  supabase_user_id: user.id,
                  email: adminRecord.email,
                  full_name: adminRecord.full_name,
                  role: adminRecord.role,
                };
                return next();
              } else {
                return res.status(403).json({
                  success: false,
                  error: 'Access denied. Account is authenticated but has not been granted studio administrator privileges.',
                });
              }
            } catch (queryErr) {
              return res.status(403).json({
                success: false,
                error: 'Administrator authorization check failed.',
              });
            }
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
