const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');
const { requireAdmin } = require('../middleware/auth');
const db = require('../db');
const config = require('../config');

// POST /api/upload (Admin only)
router.post('/', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    const filename = req.file.filename;
    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    // If Supabase is configured with a storage bucket, upload buffer to Supabase Storage
    const supabase = db.getSupabaseClient();
    if (supabase && config.supabase.storageBucket) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const { data, error } = await supabase.storage
          .from(config.supabase.storageBucket)
          .upload(`portfolio/${filename}`, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from(config.supabase.storageBucket)
            .getPublicUrl(`portfolio/${filename}`);

          if (publicUrlData && publicUrlData.publicUrl) {
            return res.json({
              success: true,
              message: 'Image uploaded to Supabase Storage successfully.',
              url: publicUrlData.publicUrl,
              storage: 'supabase',
            });
          }
        } else {
          console.warn('Supabase storage upload returned error, using local fallback:', error?.message);
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload exception, using local fallback:', storageErr.message);
      }
    }

    // Return local uploaded file URL
    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: localUrl,
      filename,
      storage: 'local',
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to upload image.' });
  }
});

module.exports = router;
