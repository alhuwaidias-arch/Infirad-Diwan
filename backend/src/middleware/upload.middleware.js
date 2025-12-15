// File Upload Middleware using Multer
const multer = require('multer');
const path = require('path');

// File type validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

// Configure multer for memory storage
const storage = multer.memoryStorage();

/**
 * File filter function
 */
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

/**
 * Multer configuration for images only
 */
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES)
});

/**
 * Multer configuration for documents only
 */
const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES)
});

/**
 * Multer configuration for any allowed file type
 */
const uploadAny = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },
  fileFilter: fileFilter(ALL_ALLOWED_TYPES)
});

/**
 * Error handling middleware for multer
 */
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: `Maximum ${MAX_FILES} files allowed`
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  
  next();
}

/**
 * Validate uploaded files
 */
function validateFiles(req, res, next) {
  if (!req.file && !req.files) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please select a file to upload'
    });
  }
  next();
}

module.exports = {
  uploadImage,
  uploadDocument,
  uploadAny,
  handleUploadError,
  validateFiles,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES
};
