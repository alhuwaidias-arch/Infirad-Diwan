// Content Management Routes
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ============================================================================
// PUBLIC ROUTES - Published Content
// ============================================================================

/**
 * @route   GET /api/content/published
 * @desc    Get all published content
 * @access  Public
 */
router.get('/published', contentController.getPublishedContent);

/**
 * @route   GET /api/content/published/:slug
 * @desc    Get published content by slug
 * @access  Public
 */
router.get('/published/:slug', contentController.getPublishedBySlug);

/**
 * @route   GET /api/content/search
 * @desc    Search published content
 * @access  Public
 */
router.get('/search', contentController.searchContent);

// ============================================================================
// PRIVATE ROUTES - Content Submissions
// ============================================================================

/**
 * @route   POST /api/content/submit
 * @desc    Submit new content
 * @access  Private (Contributors)
 */
router.post('/submit', authenticate, contentController.submitContent);

/**
 * @route   GET /api/content/submissions
 * @desc    Get user's submissions
 * @access  Private
 */
router.get('/submissions', authenticate, contentController.getUserSubmissions);

/**
 * @route   GET /api/content/submissions/:id
 * @desc    Get submission by ID
 * @access  Private
 */
router.get('/submissions/:id', authenticate, contentController.getSubmissionById);

/**
 * @route   PUT /api/content/submissions/:id
 * @desc    Update submission (before review)
 * @access  Private
 */
router.put('/submissions/:id', authenticate, contentController.updateSubmission);

/**
 * @route   DELETE /api/content/submissions/:id
 * @desc    Delete submission
 * @access  Private
 */
router.delete('/submissions/:id', authenticate, contentController.deleteSubmission);

// ============================================================================
// AUDITOR ROUTES - Review & Approval
// ============================================================================

/**
 * @route   GET /api/content/pending-reviews
 * @desc    Get pending reviews for auditor
 * @access  Private (Auditors)
 */
router.get('/pending-reviews', 
  authenticate, 
  authorize(['content_auditor', 'technical_auditor', 'admin']), 
  contentController.getPendingReviews
);

/**
 * @route   POST /api/content/submissions/:id/review
 * @desc    Submit review for content
 * @access  Private (Auditors)
 */
router.post('/submissions/:id/review', 
  authenticate, 
  authorize(['content_auditor', 'technical_auditor', 'admin']), 
  contentController.submitReview
);

/**
 * @route   POST /api/content/submissions/:id/approve
 * @desc    Approve content submission
 * @access  Private (Auditors)
 */
router.post('/submissions/:id/approve', 
  authenticate, 
  authorize(['content_auditor', 'technical_auditor', 'admin']), 
  contentController.approveContent
);

/**
 * @route   POST /api/content/submissions/:id/reject
 * @desc    Reject content submission
 * @access  Private (Auditors)
 */
router.post('/submissions/:id/reject', 
  authenticate, 
  authorize(['content_auditor', 'technical_auditor', 'admin']), 
  contentController.rejectContent
);

// ============================================================================
// ADMIN ROUTES - Publishing
// ============================================================================

/**
 * @route   POST /api/content/submissions/:id/publish
 * @desc    Publish approved content
 * @access  Private (Admin)
 */
router.post('/submissions/:id/publish', 
  authenticate, 
  authorize(['admin']), 
  contentController.publishContent
);

/**
 * @route   PUT /api/content/published/:id
 * @desc    Update published content
 * @access  Private (Admin)
 */
router.put('/published/:id', 
  authenticate, 
  authorize(['admin']), 
  contentController.updatePublishedContent
);

/**
 * @route   DELETE /api/content/published/:id
 * @desc    Unpublish content
 * @access  Private (Admin)
 */
router.delete('/published/:id', 
  authenticate, 
  authorize(['admin']), 
  contentController.unpublishContent
);

module.exports = router;
