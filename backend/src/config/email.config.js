// Email Configuration using SendGrid
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API key not configured. Email notifications will be disabled.');
}

// Email configuration
const emailConfig = {
  from: {
    email: process.env.EMAIL_FROM || 'noreply@infiradeng.com',
    name: process.env.EMAIL_FROM_NAME || 'Diwan Al-Maarifa'
  },
  adminEmail: process.env.ADMIN_EMAIL || 'info@infiradeng.com',
  enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  templates: {
    submissionReceived: 'submission-received',
    contentApproved: 'content-approved',
    contentRejected: 'content-rejected',
    reviewRequest: 'review-request',
    commentAdded: 'comment-added'
  }
};

module.exports = {
  sgMail,
  emailConfig
};
