const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/portfolio/categories (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.getPortfolioCategories();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch categories.' });
  }
});

// POST /api/portfolio/categories (Admin)
router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Category name is required.' });
    const created = await db.createPortfolioCategory(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, error: 'Failed to create category.' });
  }
});

// GET /api/portfolio (Public: published only, supports ?category=...&featured=true)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const items = await db.getPortfolioItems({
      category,
      featuredOnly: featured === 'true',
      publishedOnly: true,
    });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error('Error fetching portfolio items:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio items.' });
  }
});

// GET /api/portfolio/all (Admin: includes unpublished items)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const items = await db.getPortfolioItems({ publishedOnly: false });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error('Error fetching all portfolio items:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch all portfolio items.' });
  }
});

// GET /api/portfolio/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await db.getPortfolioItemById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Portfolio item not found.' });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching portfolio item:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch item.' });
  }
});

// POST /api/portfolio (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, image_url } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({
        success: false,
        error: 'Title and image URL are required fields.',
      });
    }
    const created = await db.createPortfolioItem(req.body);
    res.status(201).json({ success: true, message: 'Portfolio item created.', data: created });
  } catch (err) {
    console.error('Error creating portfolio item:', err);
    res.status(500).json({ success: false, error: 'Failed to create item.' });
  }
});

// PUT /api/portfolio/:id (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await db.updatePortfolioItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Portfolio item not found.' });
    res.json({ success: true, message: 'Portfolio item updated.', data: updated });
  } catch (err) {
    console.error('Error updating portfolio item:', err);
    res.status(500).json({ success: false, error: 'Failed to update item.' });
  }
});

// DELETE /api/portfolio/:id (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deletePortfolioItem(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Portfolio item not found.' });
    res.json({ success: true, message: 'Portfolio item deleted.' });
  } catch (err) {
    console.error('Error deleting portfolio item:', err);
    res.status(500).json({ success: false, error: 'Failed to delete item.' });
  }
});

module.exports = router;
