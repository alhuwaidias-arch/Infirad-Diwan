-- Migration: Create content_attachments table
-- Description: Store file attachments for content submissions
-- Date: 2025-12-15

-- Create content_attachments table
CREATE TABLE IF NOT EXISTS content_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content_submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attachments_content ON content_attachments(content_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploader ON content_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON content_attachments(uploaded_at DESC);

-- Add comments for documentation
COMMENT ON TABLE content_attachments IS 'Stores file attachments (images, documents) for content submissions';
COMMENT ON COLUMN content_attachments.id IS 'Unique identifier for the attachment';
COMMENT ON COLUMN content_attachments.content_id IS 'Reference to the content submission (nullable for orphaned uploads)';
COMMENT ON COLUMN content_attachments.file_name IS 'Original file name';
COMMENT ON COLUMN content_attachments.file_type IS 'MIME type of the file';
COMMENT ON COLUMN content_attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN content_attachments.file_url IS 'Public URL to access the file';
COMMENT ON COLUMN content_attachments.storage_key IS 'Storage provider key (e.g., Cloudinary public_id)';
COMMENT ON COLUMN content_attachments.uploaded_by IS 'User who uploaded the file';
COMMENT ON COLUMN content_attachments.uploaded_at IS 'Timestamp when file was uploaded';
