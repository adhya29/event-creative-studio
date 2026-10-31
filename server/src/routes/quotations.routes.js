const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// POST /api/quotations (Public: customer event quotation request)
router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      event_type,
      event_date,
      event_location,
      required_services,
      estimated_budget,
      additional_requirements,
    } = req.body;

    // Strict validation
    const errors = [];
    if (!full_name || full_name.trim().length < 2) errors.push('Please enter a valid full name.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('Please enter a valid email address.');
    if (!phone || phone.trim().length < 6) errors.push('Please enter a valid contact phone number.');
    if (!event_type || event_type.trim().length < 2) errors.push('Please specify the type of event.');
    if (!event_date || event_date.trim().length < 2) errors.push('Please specify the expected event date or range.');
    if (!event_location || event_location.trim().length < 2) errors.push('Please specify the event venue or city.');
    if (!Array.isArray(required_services) || required_services.length === 0) {
      errors.push('Please select at least one required creative service.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors, error: errors[0] });
    }

    const created = await db.createQuotation({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      event_type: event_type.trim(),
      event_date: event_date.trim(),
      event_location: event_location.trim(),
      required_services,
      estimated_budget: estimated_budget ? estimated_budget.trim() : 'On Discussion',
      additional_requirements: additional_requirements ? additional_requirements.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully! We will prepare a bespoke quotation and get back to you within 24 hours.',
      data: created,
    });
  } catch (err) {
    console.error('Error submitting quotation request:', err);
    res.status(500).json({ success: false, error: 'Failed to process quotation request.' });
  }
});

// GET /api/quotations (Admin: list quotations with optional ?status=)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const quotations = await db.getQuotations({ status });
    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (err) {
    console.error('Error fetching quotations:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch quotations.' });
  }
});

// GET /api/quotations/:id (Admin)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const quotation = await db.getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, error: 'Quotation request not found.' });
    res.json({ success: true, data: quotation });
  } catch (err) {
    console.error('Error fetching quotation details:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch quotation.' });
  }
});

// PATCH /api/quotations/:id/status (Admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, internal_notes } = req.body;
    const updated = await db.updateQuotation(req.params.id, { status, internal_notes });
    if (!updated) return res.status(404).json({ success: false, error: 'Quotation request not found.' });
    res.json({ success: true, message: 'Quotation request updated successfully.', data: updated });
  } catch (err) {
    console.error('Error updating quotation:', err);
    res.status(500).json({ success: false, error: 'Failed to update quotation.' });
  }
});

// DELETE /api/quotations/:id (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteQuotation(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Quotation request not found.' });
    res.json({ success: true, message: 'Quotation record deleted successfully.' });
  } catch (err) {
    console.error('Error deleting quotation:', err);
    res.status(500).json({ success: false, error: 'Failed to delete quotation.' });
  }
});

module.exports = router;
