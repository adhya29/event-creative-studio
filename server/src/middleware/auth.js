const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

module.exports = {
  async requireAdmin(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required. Missing Bearer token.',
        });
      }

      const token = authHeader.split(' ')[1];
      const isSupabase = db.isSupabaseConfigured();

      // 1. Development mode only: verify local custom JWT when Supabase is not configured
      if (!config.isProduction && !isSupabase) {
        try {
          const decoded = jwt.verify(token, config.admin.jwtSecret);
          req.admin = decoded;
          return next();
        } catch (jwtErr) {
          return res.status(401).json({
            success: false,
            error: 'Invalid or expired development session token.',
          });
        }
      }

      // 2. Production or Supabase-configured mode: Validate token via Supabase Auth
      const supabase = db.getSupabaseClient();
      if (!supabase) {
        return res.status(500).json({
          success: false,
          error: 'Authentication service unavailable: Supabase client not initialized.',
        });
      }

      let userData = null;
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data || !data.user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid or expired authentication session.',
          });
        }
        userData = data.user;
      } catch (tokenErr) {
        return res.status(401).json({
          success: false,
          error: 'Invalid authentication token.',
        });
      }

      // 3. Strictly verify user's UUID in the admins table (UUID-bound admin model)
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admins')
        .select('id, email, role, full_name, is_active')
        .eq('supabase_user_id', userData.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminErr) {
        return res.status(403).json({
          success: false,
          error: 'Administrator authorization check failed.',
        });
      }

      if (!adminRecord) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Account is authenticated in Supabase but has not been granted studio administrator privileges.',
        });
      }

      req.admin = {
        id: adminRecord.id,
        supabase_user_id: userData.id,
        email: adminRecord.email,
        full_name: adminRecord.full_name,
        role: adminRecord.role,
      };

      return next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error in authorization' });
    }
  },
};
