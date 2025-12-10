// Workflow Service
const { query } = require('../database/connection');
const emailService = require('./email.service');

/**
 * Process content submission workflow
 * Automatically routes content to appropriate auditors
 */
async function processSubmission(submissionId) {
  try {
    // Get submission details
    const submissionResult = await query(
      `SELECT cs.*, u.email as author_email, u.full_name as author_name
       FROM content_submissions cs
       JOIN users u ON cs.author_id = u.id
       WHERE cs.id = $1`,
      [submissionId]
    );
    
    if (submissionResult.rows.length === 0) {
      throw new Error('Submission not found');
    }
    
    const submission = submissionResult.rows[0];
    
    // Update status to pending content review
    await query(
      `UPDATE content_submissions 
       SET status = 'pending_content_review', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [submissionId]
    );
    
    // Send confirmation to author
    await emailService.sendSubmissionNotification(submission, {
      email: submission.author_email,
      full_name: submission.author_name
    });
    
    // Notify content auditors
    const auditorsResult = await query(
      `SELECT email, full_name 
       FROM users 
       WHERE role = 'content_auditor' AND status = 'active'`
    );
    
    for (const auditor of auditorsResult.rows) {
      await emailService.sendReviewRequestNotification(
        { ...submission, author_name: submission.author_name },
        auditor
      );
    }
    
    console.log(`Submission ${submissionId} routed to content auditors`);
    return { success: true };
    
  } catch (error) {
    console.error('Process submission error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process review decision
 * Routes content based on auditor decision
 */
async function processReviewDecision(submissionId, reviewerId, decision, comments) {
  try {
    // Get submission and reviewer details
    const submissionResult = await query(
      `SELECT cs.*, u.email as author_email, u.full_name as author_name,
              r.role as reviewer_role
       FROM content_submissions cs
       JOIN users u ON cs.author_id = u.id
       JOIN users r ON r.id = $2
       WHERE cs.id = $1`,
      [submissionId, reviewerId]
    );
    
    if (submissionResult.rows.length === 0) {
      throw new Error('Submission or reviewer not found');
    }
    
    const submission = submissionResult.rows[0];
    const reviewerRole = submission.reviewer_role;
    
    // Send decision notification to author
    await emailService.sendReviewDecisionNotification(
      submission,
      { email: submission.author_email, full_name: submission.author_name },
      decision,
      comments
    );
    
    // If approved by content auditor, notify technical auditors
    if (decision === 'approved' && reviewerRole === 'content_auditor') {
      const technicalAuditorsResult = await query(
        `SELECT email, full_name 
         FROM users 
         WHERE role = 'technical_auditor' AND status = 'active'`
      );
      
      for (const auditor of technicalAuditorsResult.rows) {
        await emailService.sendReviewRequestNotification(
          { ...submission, author_name: submission.author_name },
          auditor
        );
      }
      
      console.log(`Submission ${submissionId} routed to technical auditors`);
    }
    
    // If approved by technical auditor, notify admin for publishing
    if (decision === 'approved' && reviewerRole === 'technical_auditor') {
      const adminsResult = await query(
        `SELECT email, full_name 
         FROM users 
         WHERE role = 'admin' AND status = 'active'`
      );
      
      for (const admin of adminsResult.rows) {
        await emailService.sendReviewRequestNotification(
          { ...submission, author_name: submission.author_name },
          admin
        );
      }
      
      console.log(`Submission ${submissionId} approved and ready for publishing`);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Process review decision error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process content publication
 * Notifies author when content is published
 */
async function processPublication(contentId) {
  try {
    // Get content and author details
    const contentResult = await query(
      `SELECT cs.*, u.email as author_email, u.full_name as author_name
       FROM content_submissions cs
       JOIN users u ON cs.author_id = u.id
       WHERE cs.id = $1`,
      [contentId]
    );
    
    if (contentResult.rows.length === 0) {
      throw new Error('Content not found');
    }
    
    const content = contentResult.rows[0];
    
    // Send publication notification to author
    await emailService.sendPublicationNotification(
      content,
      { email: content.author_email, full_name: content.author_name }
    );
    
    console.log(`Publication notification sent for content ${contentId}`);
    return { success: true };
    
  } catch (error) {
    console.error('Process publication error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get workflow statistics
 */
async function getWorkflowStatistics() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
        COUNT(*) FILTER (WHERE status = 'pending_content_review') as pending_content_review,
        COUNT(*) FILTER (WHERE status = 'pending_technical_review') as pending_technical_review,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'published') as published_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE status = 'needs_revision') as needs_revision_count,
        AVG(EXTRACT(EPOCH FROM (published_at - created_at))) FILTER (WHERE published_at IS NOT NULL) as avg_time_to_publish
      FROM content_submissions
    `);
    
    return result.rows[0];
    
  } catch (error) {
    console.error('Get workflow statistics error:', error);
    return null;
  }
}

/**
 * Get pending reviews count by role
 */
async function getPendingReviewsCount(role) {
  try {
    let statusCondition;
    if (role === 'content_auditor') {
      statusCondition = "status = 'pending_content_review'";
    } else if (role === 'technical_auditor') {
      statusCondition = "status = 'pending_technical_review'";
    } else if (role === 'admin') {
      statusCondition = "status = 'approved'";
    } else {
      return 0;
    }
    
    const result = await query(
      `SELECT COUNT(*) FROM content_submissions WHERE ${statusCondition}`
    );
    
    return parseInt(result.rows[0].count);
    
  } catch (error) {
    console.error('Get pending reviews count error:', error);
    return 0;
  }
}

module.exports = {
  processSubmission,
  processReviewDecision,
  processPublication,
  getWorkflowStatistics,
  getPendingReviewsCount
};
