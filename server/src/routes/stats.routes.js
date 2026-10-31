const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json({
      success: true,
      data: stats,
      supabaseConnected: db.isSupabaseConfigured(),
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard metrics.' });
  }
});

module.exports = router;
