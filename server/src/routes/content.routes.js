const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/content (Public)
router.get('/', async (req, res) => {
  try {
    const all = await db.getAllWebsiteContent();
    // Format into an easily accessible dictionary { [id]: data }
    const contentMap = {};
    all.forEach((item) => {
      contentMap[item.id] = item.data;
    });
    res.json({ success: true, data: contentMap, raw: all });
  } catch (err) {
    console.error('Error fetching website content:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch content.' });
  }
});

// GET /api/content/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const item = await db.getWebsiteContent(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Content section not found.' });
    res.json({ success: true, data: item.data, raw: item });
  } catch (err) {
    console.error('Error fetching content section:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch content section.' });
  }
});

// PUT /api/content/:id (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const dataPayload = req.body;
    if (!dataPayload || typeof dataPayload !== 'object') {
      return res.status(400).json({ success: false, error: 'Data payload must be a JSON object.' });
    }

    const updated = await db.updateWebsiteContent(id, dataPayload);
    res.json({
      success: true,
      message: `Content section '${id}' updated successfully.`,
      data: updated.data,
    });
  } catch (err) {
    console.error('Error updating website content:', err);
    res.status(500).json({ success: false, error: 'Failed to update content.' });
  }
});

module.exports = router;
