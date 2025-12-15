-- Migration: Create email_notifications table
-- Description: Store email notification logs
-- Date: 2025-12-15

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    content_id UUID REFERENCES content_submissions(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_content ON email_notifications(content_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON email_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON email_notifications(recipient_email);

-- Add comments for documentation
COMMENT ON TABLE email_notifications IS 'Stores email notification logs';
COMMENT ON COLUMN email_notifications.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN email_notifications.recipient_email IS 'Email address of the recipient';
COMMENT ON COLUMN email_notifications.subject IS 'Email subject';
COMMENT ON COLUMN email_notifications.template_name IS 'Name of the email template used';
COMMENT ON COLUMN email_notifications.content_id IS 'Reference to content submission (if applicable)';
COMMENT ON COLUMN email_notifications.status IS 'Delivery status: pending, sent, failed';
COMMENT ON COLUMN email_notifications.sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN email_notifications.error_message IS 'Error message if sending failed';
COMMENT ON COLUMN email_notifications.created_at IS 'Timestamp when notification was created';
