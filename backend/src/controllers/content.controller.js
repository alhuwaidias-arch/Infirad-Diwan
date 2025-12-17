// Content Controller - Fixed for correct database schema
// Database columns: submission_id, contributor_id, title_ar, content_ar, submission_status
const { query, getClient } = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const { sendSubmissionNotification } = require('../services/email.service');

/**
 * Helper function to generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // Keep Arabic, English, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 200); // Limit length
}

/**
 * Get published content (public)
 */
async function getPublishedContent(req, res) {
  try {
    const { page = 1, limit = 20, category, content_type, search } = req.query;
    const offset = (page - 1) * limit;
    
    const conditions = ["submission_status = 'published'"];
    const values = [];
    let paramCount = 1;
    
    if (category) {
      conditions.push(`category_id = $${paramCount}`);
      values.push(category);
      paramCount++;
    }
    
    if (content_type) {
      conditions.push(`content_type = $${paramCount}`);
      values.push(content_type);
      paramCount++;
    }
    
    if (search) {
      conditions.push(`(title_ar ILIKE $${paramCount} OR content_ar ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }
    
    const whereClause = conditions.join(' AND ');
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM content_submissions WHERE ${whereClause}`,
      values
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Get content
    values.push(limit, offset);
    const result = await query(
      `SELECT cs.submission_id, cs.title_ar as title, cs.slug, cs.content_ar as content, 
              cs.content_type, cs.tags, cs.submitted_at as published_at, cs.view_count,
              c.name_ar as category_name_ar, c.name_en as category_name_en,
              u.full_name as author_name, u.username as author_username
       FROM content_submissions cs
       LEFT JOIN categories c ON cs.category_id = c.category_id
       LEFT JOIN users u ON cs.contributor_id = u.user_id
       WHERE ${whereClause}
       ORDER BY cs.submitted_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );
    
    // Map submission_id to id for frontend compatibility
    const content = result.rows.map(row => ({
      id: row.submission_id,
      ...row
    }));
    
    res.json({
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get published content error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to get published content'
    });
  }
}

/**
 * Get published content by slug (public)
 */
async function getPublishedBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    const result = await query(
      `SELECT cs.submission_id, cs.title_ar as title, cs.slug, cs.content_ar as content, 
              cs.content_type, cs.tags, cs.submitted_at as published_at, cs.view_count,
              c.category_id, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug,
              u.user_id as author_id, u.full_name as author_name, u.username as author_username, u.bio as author_bio
       FROM content_submissions cs
       LEFT JOIN categories c ON cs.category_id = c.category_id
       LEFT JOIN users u ON cs.contributor_id = u.user_id
       WHERE cs.slug = $1 AND cs.submission_status = 'published'`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Content not found'
      });
    }
    
    // Increment view count
    await query(
      'UPDATE content_submissions SET view_count = COALESCE(view_count, 0) + 1 WHERE submission_id = $1',
      [result.rows[0].submission_id]
    );
    
    // Map for frontend compatibility
    const content = {
      id: result.rows[0].submission_id,
      ...result.rows[0]
    };
    
    res.json({ content });
    
  } catch (error) {
    console.error('Get published by slug error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to get content'
    });
  }
}

/**
 * Search content (public)
 */
async function searchContent(req, res) {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;
    
    // Simple ILIKE search (more reliable than full-text for Arabic)
    const result = await query(
      `SELECT cs.submission_id, cs.title_ar as title, cs.slug, cs.content_type, cs.submitted_at as published_at,
              c.name_ar as category_name_ar,
              u.full_name as author_name
       FROM content_submissions cs
       LEFT JOIN categories c ON cs.category_id = c.category_id
       LEFT JOIN users u ON cs.contributor_id = u.user_id
       WHERE cs.submission_status = 'published'
         AND (cs.title_ar ILIKE $1 OR cs.content_ar ILIKE $1)
       ORDER BY cs.submitted_at DESC
       LIMIT $2 OFFSET $3`,
      [searchTerm, limit, offset]
    );
    
    // Map for frontend compatibility
    const results = result.rows.map(row => ({
      id: row.submission_id,
      ...row
    }));
    
    res.json({
      results,
      query: q,
      count: results.length
    });
    
  } catch (error) {
    console.error('Search content error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to search content'
    });
  }
}

/**
 * Submit new content (contributor)
 */
async function submitContent(req, res) {
  try {
    const { title, content, category_id, content_type, tags } = req.body;
    const contributorId = req.user.id; // This is mapped from user_id
    
    // Validate required fields
    if (!title || !content || !category_id || !content_type) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title, content, category_id, and content_type are required'
      });
    }
    
    // Generate slug from title
    const slug = generateSlug(title) + '-' + Date.now();
    
    // Insert using correct column names
    const result = await query(
      `INSERT INTO content_submissions 
       (title_ar, slug, content_ar, category_id, content_type, tags, contributor_id, submission_status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted', CURRENT_TIMESTAMP)
       RETURNING submission_id, title_ar as title, slug, content_type, submission_status as status, created_at`,
      [title, slug, content, category_id, content_type, tags || [], contributorId]
    );
    
    const submission = result.rows[0];
    submission.id = submission.submission_id; // Map for frontend compatibility
    
    // Send email notification (async, don't wait)
    sendSubmissionNotification(
      {
        ...submission,
        title_ar: title,
        content_ar: content,
        type: content_type,
        submitted_at: submission.created_at,
        notes: req.body.notes || ''
      },
      req.user
    ).catch(err => console.error('Email notification error:', err));
    
    res.status(201).json({
      message: 'Content submitted successfully',
      content: submission
    });
    
  } catch (error) {
    console.error('Submit content error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to submit content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get user's submissions (contributor)
 */
async function getUserSubmissions(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const contributorId = req.user.id;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE contributor_id = $1';
    const values = [contributorId];
    let paramCount = 2;
    
    if (status) {
      whereClause += ` AND submission_status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM content_submissions ${whereClause}`,
      values
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Get submissions
    values.push(limit, offset);
    const result = await query(
      `SELECT cs.submission_id, cs.title_ar as title, cs.slug, cs.content_type, 
              cs.submission_status as status, cs.created_at, cs.updated_at,
              c.name_ar as category_name_ar
       FROM content_submissions cs
       LEFT JOIN categories c ON cs.category_id = c.category_id
       ${whereClause}
       ORDER BY cs.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );
    
    // Map for frontend compatibility
    const submissions = result.rows.map(row => ({
      id: row.submission_id,
      ...row
    }));
    
    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to get submissions'
    });
  }
}

/**
 * Get submission by ID (contributor - own submissions only)
 */
async function getSubmissionById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Contributors can only see their own submissions
    // Auditors and admins can see all
    let whereClause = 'WHERE cs.submission_id = $1';
    const values = [id];
    
    if (userRole === 'contributor') {
      whereClause += ' AND cs.contributor_id = $2';
      values.push(userId);
    }
    
    const result = await query(
      `SELECT cs.*, 
              c.name_ar as category_name_ar, c.name_en as category_name_en,
              u.full_name as author_name, u.email as author_email
       FROM content_submissions cs
       LEFT JOIN categories c ON cs.category_id = c.category_id
       LEFT JOIN users u ON cs.contributor_id = u.user_id
       ${whereClause}`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found'
      });
    }
    
    // Get workflow history
    const historyResult = await query(
      `SELECT wh.*, u.full_name as reviewer_name, u.role as reviewer_role
       FROM workflow_history wh
       LEFT JOIN users u ON wh.reviewer_id = u.user_id
       WHERE wh.submission_id = $1
       ORDER BY wh.created_at DESC`,
      [id]
    );
    
    // Map for frontend compatibility
    const submission = {
      id: result.rows[0].submission_id,
      title: result.rows[0].title_ar,
      content: result.rows[0].content_ar,
      status: result.rows[0].submission_status,
      ...result.rows[0]
    };
    
    res.json({
      submission,
      workflow_history: historyResult.rows
    });
    
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to get submission'
    });
  }
}

/**
 * Update submission (contributor - own drafts only)
 */
async function updateSubmission(req, res) {
  try {
    const { id } = req.params;
    const { title, content, category_id, content_type, tags } = req.body;
    const contributorId = req.user.id;
    
    // Check if submission exists and is owned by user and is a draft
    const checkResult = await query(
      'SELECT submission_status FROM content_submissions WHERE submission_id = $1 AND contributor_id = $2',
      [id, contributorId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found'
      });
    }
    
    if (checkResult.rows[0].submission_status !== 'draft') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Can only edit draft submissions'
      });
    }
    
    // Update submission
    const result = await query(
      `UPDATE content_submissions
       SET title_ar = COALESCE($1, title_ar),
           content_ar = COALESCE($2, content_ar),
           category_id = COALESCE($3, category_id),
           content_type = COALESCE($4, content_type),
           tags = COALESCE($5, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE submission_id = $6 AND contributor_id = $7
       RETURNING submission_id, title_ar as title, slug, content_type, submission_status as status, updated_at`,
      [title, content, category_id, content_type, tags, id, contributorId]
    );
    
    const submission = {
      id: result.rows[0].submission_id,
      ...result.rows[0]
    };
    
    res.json({
      message: 'Submission updated successfully',
      submission
    });
    
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update submission'
    });
  }
}

/**
 * Delete submission (contributor - own drafts only)
 */
async function deleteSubmission(req, res) {
  try {
    const { id } = req.params;
    const contributorId = req.user.id;
    
    // Check if submission exists and is owned by user and is a draft
    const checkResult = await query(
      'SELECT submission_status FROM content_submissions WHERE submission_id = $1 AND contributor_id = $2',
      [id, contributorId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found'
      });
    }
    
    if (checkResult.rows[0].submission_status !== 'draft') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Can only delete draft submissions'
      });
    }
    
    // Delete submission
    await query(
      'DELETE FROM content_submissions WHERE submission_id = $1 AND contributor_id = $2',
      [id, contributorId]
    );
    
    res.json({
      message: 'Submission deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to delete submission'
    });
  }
}

/**
 * Get pending submissions (auditor)
 */
async function getPendingSubmissions(req, res) {
  try {
    const { page = 1, limit = 20, status = 'submitted' } = req.query;
    const offset = (page - 1) * limit;
    const userRole = req.user.role;
    
    // Determine which statuses this role can review
    let allowedStatuses = [];
    if (userRole === 'content_auditor') {
      allowedStatuses = ['submitted', 'under_content_review'];
    } else if (userRole === 'technical_auditor') {
      allowedStatuses = ['under_technical_review'];
    } else if (userRole === 'admin') {
      allowedStatuses = ['submitted', 'under_content_review', 'under_technical_review', 'approved'];
    }
    
    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You cannot review submissions with this status'
      });
    }
    
    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM content_submissions WHERE submission_status = $1',
      [status]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Get submissions
    const result = await query(
      `SELECT cs.submission_id, cs.title_ar as title, cs.slug, cs.content_type, 
              cs.submission_status as status, cs.created_at,
              c.name_ar as category_name_ar,
              u.full_name as author_name, u.email as author_email
       FROM content_submissions cs
       LEFT JOIN categories c ON cs.category_id = c.category_id
       LEFT JOIN users u ON cs.contributor_id = u.user_id
       WHERE cs.submission_status = $1
       ORDER BY cs.created_at ASC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );
    
    // Map for frontend compatibility
    const submissions = result.rows.map(row => ({
      id: row.submission_id,
      ...row
    }));
    
    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to get pending submissions'
    });
  }
}

/**
 * Review submission (auditor)
 */
async function reviewSubmission(req, res) {
  try {
    const { id } = req.params;
    const { decision, comments } = req.body;
    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;
    
    // Validate decision
    if (!['approve', 'reject', 'request_changes'].includes(decision)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid decision. Must be approve, reject, or request_changes'
      });
    }
    
    // Get current submission status
    const checkResult = await query(
      'SELECT submission_status, contributor_id FROM content_submissions WHERE submission_id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found'
      });
    }
    
    const currentStatus = checkResult.rows[0].submission_status;
    
    // Determine new status based on role and decision
    let newStatus;
    if (reviewerRole === 'content_auditor') {
      if (decision === 'approve') {
        newStatus = 'under_technical_review';
      } else if (decision === 'reject') {
        newStatus = 'rejected';
      } else {
        newStatus = 'draft'; // Request changes
      }
    } else if (reviewerRole === 'technical_auditor') {
      if (decision === 'approve') {
        newStatus = 'approved';
      } else if (decision === 'reject') {
        newStatus = 'rejected';
      } else {
        newStatus = 'under_content_review'; // Request changes
      }
    } else if (reviewerRole === 'admin') {
      if (decision === 'approve') {
        newStatus = 'published';
      } else if (decision === 'reject') {
        newStatus = 'rejected';
      } else {
        newStatus = currentStatus; // Keep current status
      }
    }
    
    // Update submission status
    await query(
      'UPDATE content_submissions SET submission_status = $1, updated_at = CURRENT_TIMESTAMP WHERE submission_id = $2',
      [newStatus, id]
    );
    
    // Record in workflow history
    await query(
      `INSERT INTO workflow_history (submission_id, reviewer_id, action, from_status, to_status, comments)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, reviewerId, decision, currentStatus, newStatus, comments]
    );
    
    res.json({
      message: 'Review submitted successfully',
      submission: {
        id,
        previous_status: currentStatus,
        new_status: newStatus
      }
    });
    
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to submit review'
    });
  }
}

/**
 * Publish content (admin)
 */
async function publishContent(req, res) {
  try {
    const { id } = req.params;
    
    // Check if submission is approved
    const checkResult = await query(
      'SELECT submission_status FROM content_submissions WHERE submission_id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found'
      });
    }
    
    if (checkResult.rows[0].submission_status !== 'approved') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Can only publish approved submissions'
      });
    }
    
    // Update to published
    await query(
      `UPDATE content_submissions 
       SET submission_status = 'published', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE submission_id = $1`,
      [id]
    );
    
    res.json({
      message: 'Content published successfully'
    });
    
  } catch (error) {
    console.error('Publish content error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to publish content'
    });
  }
}

module.exports = {
  getPublishedContent,
  getPublishedBySlug,
  searchContent,
  submitContent,
  getUserSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getPendingSubmissions,
  reviewSubmission,
  publishContent
};
