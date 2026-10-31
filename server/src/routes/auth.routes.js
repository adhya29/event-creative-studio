const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = db.getSupabaseClient();
    const isSupabase = db.isSupabaseConfigured();

    // 1. Supabase / Production mode: Authenticate exclusively via Supabase Auth
    if (isSupabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError || !authData || !authData.user || !authData.session) {
        return res.status(401).json({
          success: false,
          error: authError?.message || 'Invalid administrator email or password.',
        });
      }

      // Strictly verify that this user's UUID is an active administrator in the admins table
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admins')
        .select('id, email, role, full_name, is_active')
        .eq('supabase_user_id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminErr) {
        return res.status(403).json({
          success: false,
          error: 'Administrator verification query failed.',
        });
      }

      if (!adminRecord) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Account is authenticated in Supabase but has not been granted studio administrator privileges.',
        });
      }

      return res.json({
        success: true,
        token: authData.session.access_token,
        user: {
          id: adminRecord.id,
          supabase_user_id: authData.user.id,
          email: adminRecord.email,
          full_name: adminRecord.full_name,
          role: adminRecord.role,
        },
      });
    }

    // 2. Production safety: Local credentials strictly prohibited in production mode
    if (config.isProduction) {
      return res.status(500).json({
        success: false,
        error: 'Production authentication configuration error: Supabase is not configured.',
      });
    }

    // 3. Development mode fallback: local admin credentials
    if (
      normalizedEmail === config.admin.email.toLowerCase() &&
      password === config.admin.defaultPassword
    ) {
      const token = jwt.sign(
        {
          email: normalizedEmail,
          role: 'super_admin',
          full_name: 'Master Creative Director',
          dev_local: true,
        },
        config.admin.jwtSecret,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          email: normalizedEmail,
          role: 'super_admin',
          full_name: 'Master Creative Director',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid administrator email or password.',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'An unexpected error occurred during login.' });
  }
});

// GET /api/auth/verify
router.get('/verify', requireAdmin, (req, res) => {
  res.json({
    success: true,
    user: req.admin,
    supabaseConnected: db.isSupabaseConfigured(),
  });
});

module.exports = router;
