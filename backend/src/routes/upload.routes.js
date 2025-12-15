// Upload Routes
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { 
  uploadImage, 
  uploadDocument, 
  uploadAny, 
  handleUploadError,
  validateFiles 
} = require('../middleware/upload.middleware');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image
 * @access  Private
 */
router.post(
  '/image',
  authenticate,
  uploadImage.single('file'),
  handleUploadError,
  validateFiles,
  uploadController.uploadImage
);

/**
 * @route   POST /api/upload/document
 * @desc    Upload single document
 * @access  Private
 */
router.post(
  '/document',
  authenticate,
  uploadDocument.single('file'),
  handleUploadError,
  validateFiles,
  uploadController.uploadDocument
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files (images and/or documents)
 * @access  Private
 */
router.post(
  '/multiple',
  authenticate,
  uploadAny.array('files', 5),
  handleUploadError,
  validateFiles,
  uploadController.uploadMultiple
);

/**
 * @route   POST /api/upload/link
 * @desc    Link uploaded files to content submission
 * @access  Private
 */
router.post(
  '/link',
  authenticate,
  uploadController.linkFilesToContent
);

/**
 * @route   GET /api/upload/content/:contentId
 * @desc    Get all files for a content submission
 * @access  Public
 */
router.get(
  '/content/:contentId',
  uploadController.getContentFiles
);

/**
 * @route   DELETE /api/upload/:id
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  uploadController.deleteFile
);

module.exports = router;
