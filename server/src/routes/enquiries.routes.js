const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// POST /api/enquiries (Public: customer enquiry submission)
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, interested_service, message } = req.body;

    // Strict validation
    const errors = [];
    if (!full_name || full_name.trim().length < 2) errors.push('Please enter a valid full name (at least 2 characters).');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('Please enter a valid email address.');
    if (!phone || phone.trim().length < 6) errors.push('Please enter a valid phone number.');
    if (!interested_service) errors.push('Please select the service you are interested in.');
    if (!message || message.trim().length < 5) errors.push('Please provide a message with at least 5 characters.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors, error: errors[0] });
    }

    const created = await db.createEnquiry({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      interested_service: interested_service.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our creative team will contact you shortly.',
      data: created,
    });
  } catch (err) {
    console.error('Error submitting enquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to process enquiry submission.' });
  }
});

// GET /api/enquiries (Admin: list enquiries with optional ?status=)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const enquiries = await db.getEnquiries({ status });
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries.' });
  }
});

// GET /api/enquiries/:id (Admin)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const enquiry = await db.getEnquiryById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry record not found.' });
    res.json({ success: true, data: enquiry });
  } catch (err) {
    console.error('Error fetching enquiry details:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiry.' });
  }
});

// PATCH /api/enquiries/:id/status (Admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, internal_notes } = req.body;
    const updated = await db.updateEnquiry(req.params.id, { status, internal_notes });
    if (!updated) return res.status(404).json({ success: false, error: 'Enquiry record not found.' });
    res.json({ success: true, message: 'Enquiry updated successfully.', data: updated });
  } catch (err) {
    console.error('Error updating enquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to update enquiry.' });
  }
});

// DELETE /api/enquiries/:id (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteEnquiry(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Enquiry record not found.' });
    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (err) {
    console.error('Error deleting enquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to delete enquiry.' });
  }
});

module.exports = router;
