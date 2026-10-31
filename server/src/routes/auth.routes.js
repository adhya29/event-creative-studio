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

    // 1. If Supabase is configured, try Supabase Auth sign in
    const supabase = db.getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!error && data && data.session && data.user) {
          // Strictly verify that the authenticated user is an explicitly provisioned active administrator
          const { data: adminRecord, error: adminErr } = await supabase
            .from('admins')
            .select('id, email, role, full_name, is_active')
            .eq('supabase_user_id', data.user.id)
            .eq('is_active', true)
            .single();

          if (!adminErr && adminRecord) {
            return res.json({
              success: true,
              token: data.session.access_token,
              user: {
                id: adminRecord.id,
                supabase_user_id: data.user.id,
                email: adminRecord.email,
                full_name: adminRecord.full_name,
                role: adminRecord.role,
              },
            });
          } else {
            return res.status(403).json({
              success: false,
              error: 'Access denied. Account is authenticated in Supabase but has not been granted studio administrator privileges.',
            });
          }
        }
      } catch (authErr) {
        console.warn('Supabase Auth failed, checking system credentials:', authErr.message);
      }
    }

    // 2. Validate against configured admin email & default password
    if (
      normalizedEmail === config.admin.email.toLowerCase() &&
      password === config.admin.defaultPassword
    ) {
      const token = jwt.sign(
        {
          email: normalizedEmail,
          role: 'super_admin',
          full_name: 'Master Creative Director',
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
