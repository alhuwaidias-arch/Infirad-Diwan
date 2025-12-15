// Upload Controller
const { uploadToCloudinary, deleteFromCloudinary, getOptimizedImageUrl } = require('../config/storage.config');
const { query } = require('../database/connection');

/**
 * Upload single image
 */
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select an image to upload'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'diwan-maarifa/images',
      resourceType: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Save to database
    const dbResult = await query(
      `INSERT INTO content_attachments (file_name, file_type, file_size, file_url, storage_key, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        result.secure_url,
        result.public_id,
        req.user.id
      ]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      file: {
        id: dbResult.rows[0].id,
        url: result.secure_url,
        thumbnail: getOptimizedImageUrl(result.public_id, { width: 300, height: 300, crop: 'fill' }),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload image'
    });
  }
}

/**
 * Upload single document
 */
async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select a document to upload'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'diwan-maarifa/documents',
      resourceType: 'raw'
    });

    // Save to database
    const dbResult = await query(
      `INSERT INTO content_attachments (file_name, file_type, file_size, file_url, storage_key, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        result.secure_url,
        result.public_id,
        req.user.id
      ]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      file: {
        id: dbResult.rows[0].id,
        url: result.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload document'
    });
  }
}

/**
 * Upload multiple files
 */
async function uploadMultiple(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files provided',
        message: 'Please select files to upload'
      });
    }

    const uploadedFiles = [];
    const errors = [];

    // Upload each file
    for (const file of req.files) {
      try {
        // Determine resource type based on mime type
        const isImage = file.mimetype.startsWith('image/');
        const resourceType = isImage ? 'image' : 'raw';
        const folder = isImage ? 'diwan-maarifa/images' : 'diwan-maarifa/documents';

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, {
          folder: folder,
          resourceType: resourceType,
          ...(isImage && {
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' }
            ]
          })
        });

        // Save to database
        const dbResult = await query(
          `INSERT INTO content_attachments (file_name, file_type, file_size, file_url, storage_key, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            file.originalname,
            file.mimetype,
            file.size,
            result.secure_url,
            result.public_id,
            req.user.id
          ]
        );

        uploadedFiles.push({
          id: dbResult.rows[0].id,
          url: result.secure_url,
          ...(isImage && {
            thumbnail: getOptimizedImageUrl(result.public_id, { width: 300, height: 300, crop: 'fill' })
          }),
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype
        });

      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `Uploaded ${uploadedFiles.length} of ${req.files.length} files`,
      files: uploadedFiles,
      ...(errors.length > 0 && { errors })
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload files'
    });
  }
}

/**
 * Link uploaded files to content submission
 */
async function linkFilesToContent(req, res) {
  try {
    const { contentId, fileIds } = req.body;

    if (!contentId || !fileIds || !Array.isArray(fileIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Content ID and file IDs are required'
      });
    }

    // Verify content belongs to user
    const contentResult = await query(
      'SELECT id FROM content_submissions WHERE id = $1 AND submitted_by = $2',
      [contentId, req.user.id]
    );

    if (contentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Content not found',
        message: 'Content not found or you do not have permission'
      });
    }

    // Update file records to link to content
    await query(
      `UPDATE content_attachments 
       SET content_id = $1 
       WHERE id = ANY($2) AND uploaded_by = $3`,
      [contentId, fileIds, req.user.id]
    );

    res.json({
      message: 'Files linked to content successfully'
    });

  } catch (error) {
    console.error('Link files error:', error);
    res.status(500).json({
      error: 'Failed to link files',
      message: 'An error occurred while linking files'
    });
  }
}

/**
 * Get files for content
 */
async function getContentFiles(req, res) {
  try {
    const { contentId } = req.params;

    const result = await query(
      `SELECT id, file_name, file_type, file_size, file_url, uploaded_at
       FROM content_attachments
       WHERE content_id = $1
       ORDER BY uploaded_at ASC`,
      [contentId]
    );

    res.json({
      files: result.rows
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      error: 'Failed to get files',
      message: 'An error occurred while retrieving files'
    });
  }
}

/**
 * Delete uploaded file
 */
async function deleteFile(req, res) {
  try {
    const { id } = req.params;

    // Get file info
    const fileResult = await query(
      'SELECT * FROM content_attachments WHERE id = $1 AND uploaded_by = $2',
      [id, req.user.id]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        error: 'File not found',
        message: 'File not found or you do not have permission to delete it'
      });
    }

    const file = fileResult.rows[0];

    // Delete from Cloudinary
    const resourceType = file.file_type.startsWith('image/') ? 'image' : 'raw';
    await deleteFromCloudinary(file.storage_key, resourceType);

    // Delete from database
    await query('DELETE FROM content_attachments WHERE id = $1', [id]);

    res.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      message: 'An error occurred while deleting the file'
    });
  }
}

module.exports = {
  uploadImage,
  uploadDocument,
  uploadMultiple,
  linkFilesToContent,
  getContentFiles,
  deleteFile
};
