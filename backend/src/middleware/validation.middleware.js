// Validation Middleware
const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  
  next();
}

/**
 * Validate user registration
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('role')
    .optional()
    .isIn(['contributor', 'content_auditor', 'technical_auditor', 'admin'])
    .withMessage('Invalid role'),
  
  handleValidationErrors
];

/**
 * Validate user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validate content submission
 */
const validateContentSubmission = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  
  body('content_type')
    .isIn(['term', 'article'])
    .withMessage('Content type must be either "term" or "article"'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  handleValidationErrors
];

/**
 * Validate category creation
 */
const validateCategory = [
  body('name_ar')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Arabic name must be between 2 and 100 characters'),
  
  body('name_en')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('English name must be between 2 and 100 characters'),
  
  body('slug')
    .trim()
    .isSlug()
    .withMessage('Invalid slug format'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * Validate review submission
 */
const validateReview = [
  body('decision')
    .isIn(['approved', 'rejected', 'needs_revision'])
    .withMessage('Decision must be approved, rejected, or needs_revision'),
  
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments must not exceed 1000 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateContentSubmission,
  validateCategory,
  validateReview,
  handleValidationErrors
};
