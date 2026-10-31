const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/services (Public: only published services)
router.get('/', async (req, res) => {
  try {
    const services = await db.getServices({ publishedOnly: true });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch services.' });
  }
});

// GET /api/services/all (Admin: includes unpublished services)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const services = await db.getServices({ publishedOnly: false });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    console.error('Error fetching all services:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch all services.' });
  }
});

// GET /api/services/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let service = await db.getServiceBySlug(idOrSlug);
    if (!service) {
      service = await db.getServiceById(idOrSlug);
    }

    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }

    res.json({ success: true, data: service });
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch service.' });
  }
});

// POST /api/services (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, category, short_description, full_description } = req.body;
    if (!title || !category || !short_description) {
      return res.status(400).json({
        success: false,
        error: 'Title, category, and short description are required fields.',
      });
    }

    const created = await db.createService(req.body);
    res.status(201).json({ success: true, message: 'Service created successfully.', data: created });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ success: false, error: 'Failed to create service.' });
  }
});

// PUT /api/services/:id (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateService(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }
    res.json({ success: true, message: 'Service updated successfully.', data: updated });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ success: false, error: 'Failed to update service.' });
  }
});

// DELETE /api/services/:id (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteService(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ success: false, error: 'Failed to delete service.' });
  }
});

module.exports = router;
