const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { upload, verifyImageBuffer } = require('../middleware/upload');
const { requireAdmin } = require('../middleware/auth');
const db = require('../db');
const config = require('../config');

// Helper to safely delete local temporary file
function cleanupTempFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('Failed to clean up temporary upload file:', err.message);
    }
  }
}

// POST /api/upload (Admin only)
router.post('/', requireAdmin, upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    tempFilePath = req.file.path;
    const filename = req.file.filename;

    // Verify file content magic bytes (defends against disguised scripts/malicious files)
    const fileBuffer = fs.readFileSync(tempFilePath);
    if (!verifyImageBuffer(fileBuffer)) {
      cleanupTempFile(tempFilePath);
      return res.status(400).json({
        success: false,
        error: 'File content verification failed. The uploaded file is not a valid JPEG, PNG, or WebP image.',
      });
    }

    const supabase = db.getSupabaseClient();
    const isSupabase = db.isSupabaseConfigured();

    // In production mode, Supabase Storage is mandatory
    if (config.isProduction && !isSupabase) {
      cleanupTempFile(tempFilePath);
      return res.status(500).json({
        success: false,
        error: 'Production storage error: Supabase Storage is not configured.',
      });
    }

    // Upload to Supabase Storage if configured
    if (isSupabase && config.supabase.storageBucket) {
      const storagePath = `portfolio/${filename}`;
      const { data, error } = await supabase.storage
        .from(config.supabase.storageBucket)
        .upload(storagePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) {
        cleanupTempFile(tempFilePath);
        console.error('Supabase Storage upload error:', error.message);
        if (config.isProduction) {
          return res.status(502).json({
            success: false,
            error: `Failed to upload image to Supabase Storage: ${error.message}`,
          });
        }
        // In dev, fall through to local storage if non-production
      } else if (data) {
        // Clean up temporary local file after successful cloud upload
        cleanupTempFile(tempFilePath);

        const { data: publicUrlData } = supabase.storage
          .from(config.supabase.storageBucket)
          .getPublicUrl(storagePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          return res.json({
            success: true,
            message: 'Image uploaded to Supabase Storage successfully.',
            url: publicUrlData.publicUrl,
            storage: 'supabase',
          });
        }
      }
    }

    // In production, fallback to local URL is strictly forbidden
    if (config.isProduction) {
      cleanupTempFile(tempFilePath);
      return res.status(502).json({
        success: false,
        error: 'Production upload failed: Cloud storage unavailable.',
      });
    }

    // Development mode fallback: local uploaded file URL
    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    return res.json({
      success: true,
      message: 'Image uploaded to local development storage.',
      url: localUrl,
      filename,
      storage: 'local',
    });
  } catch (err) {
    cleanupTempFile(tempFilePath);
    console.error('File upload error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An unexpected error occurred while processing the image upload.',
    });
  }
});

module.exports = router;
