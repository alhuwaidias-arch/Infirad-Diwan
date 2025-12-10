-- ديوان المعرفة (Diwan Al-Maarifa) Database Schema
-- Version: 1.0
-- Date: December 10, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('contributor', 'content_auditor', 'technical_auditor', 'admin')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'inactive')),
    bio TEXT,
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    color VARCHAR(50),
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Insert default categories
INSERT INTO categories (slug, name_ar, name_en, color, display_order) VALUES
    ('physics', 'الفيزياء', 'Physics', 'primary', 1),
    ('chemistry', 'الكيمياء', 'Chemistry', 'success', 2),
    ('biology', 'الأحياء', 'Biology', 'info', 3),
    ('energy', 'الطاقة', 'Energy', 'warning', 4),
    ('engineering', 'الهندسة', 'Engineering', 'danger', 5),
    ('nature', 'الطبيعة', 'Nature', 'secondary', 6);

-- ============================================================================
-- CONTENT SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE content_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('term', 'article')),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    content JSONB NOT NULL,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 
        'ai_review', 
        'ai_approved', 
        'ai_rejected',
        'content_review', 
        'content_approved',
        'content_rejected',
        'technical_review', 
        'technical_approved',
        'technical_rejected',
        'approved', 
        'rejected', 
        'published'
    )),
    
    -- AI Review Fields
    ai_review_result JSONB,
    ai_review_score DECIMAL(3,2),
    ai_reviewed_at TIMESTAMP,
    
    -- Content Auditor Review Fields
    content_auditor_id UUID REFERENCES users(id),
    content_review_notes TEXT,
    content_review_score INTEGER CHECK (content_review_score BETWEEN 1 AND 5),
    content_reviewed_at TIMESTAMP,
    
    -- Technical Auditor Review Fields
    technical_auditor_id UUID REFERENCES users(id),
    technical_review_notes TEXT,
    technical_review_score INTEGER CHECK (technical_review_score BETWEEN 1 AND 5),
    technical_reviewed_at TIMESTAMP,
    
    -- Publishing Fields
    published_at TIMESTAMP,
    published_by UUID REFERENCES users(id),
    
    -- Metadata
    metadata JSONB,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_type ON content_submissions(type);
CREATE INDEX idx_submissions_status ON content_submissions(status);
CREATE INDEX idx_submissions_category ON content_submissions(category_id);
CREATE INDEX idx_submissions_submitted_by ON content_submissions(submitted_by);
CREATE INDEX idx_submissions_created_at ON content_submissions(created_at DESC);

-- ============================================================================
-- PUBLISHED CONTENT TABLE
-- ============================================================================
CREATE TABLE published_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES content_submissions(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('term', 'article')),
    slug VARCHAR(500) UNIQUE NOT NULL,
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    content JSONB NOT NULL,
    
    -- Metadata
    metadata JSONB,
    reading_time INTEGER, -- in minutes
    tags TEXT[],
    
    -- SEO Fields
    meta_description_ar TEXT,
    meta_description_en TEXT,
    meta_keywords TEXT[],
    
    -- Statistics
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Publishing Info
    published_by UUID REFERENCES users(id),
    published_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Search Vector for Full-Text Search
    search_vector_ar TSVECTOR,
    search_vector_en TSVECTOR,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_published_content_slug ON published_content(slug);
CREATE INDEX idx_published_content_type ON published_content(type);
CREATE INDEX idx_published_content_category ON published_content(category_id);
CREATE INDEX idx_published_content_published_at ON published_content(published_at DESC);
CREATE INDEX idx_published_content_views ON published_content(views_count DESC);
CREATE INDEX idx_published_content_active ON published_content(is_active);
CREATE INDEX idx_published_content_featured ON published_content(is_featured);

-- Full-text search indexes
CREATE INDEX idx_published_content_search_ar ON published_content USING GIN(search_vector_ar);
CREATE INDEX idx_published_content_search_en ON published_content USING GIN(search_vector_en);
CREATE INDEX idx_published_content_tags ON published_content USING GIN(tags);

-- ============================================================================
-- WORKFLOW HISTORY TABLE
-- ============================================================================
CREATE TABLE workflow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES content_submissions(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(50),
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_history_submission ON workflow_history(submission_id);
CREATE INDEX idx_workflow_history_actor ON workflow_history(actor_id);
CREATE INDEX idx_workflow_history_action ON workflow_history(action);
CREATE INDEX idx_workflow_history_created_at ON workflow_history(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    message TEXT,
    link VARCHAR(500),
    related_submission_id UUID REFERENCES content_submissions(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content_id UUID REFERENCES published_content(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_content ON analytics_events(content_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- ============================================================================
-- COMMENTS TABLE (Optional - for future use)
-- ============================================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES published_content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_approved ON comments(is_approved);

-- ============================================================================
-- USER SESSIONS TABLE (for JWT token management)
-- ============================================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON content_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_published_content_updated_at BEFORE UPDATE ON published_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update search vectors automatically
CREATE OR REPLACE FUNCTION update_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector_ar := to_tsvector('arabic', COALESCE(NEW.title_ar, '') || ' ' || COALESCE(NEW.content::text, ''));
    NEW.search_vector_en := to_tsvector('english', COALESCE(NEW.title_en, '') || ' ' || COALESCE(NEW.content::text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_published_content_search_vectors 
    BEFORE INSERT OR UPDATE ON published_content
    FOR EACH ROW EXECUTE FUNCTION update_search_vectors();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for pending reviews by auditor type
CREATE VIEW pending_reviews AS
SELECT 
    cs.id,
    cs.type,
    cs.title_ar,
    cs.status,
    c.name_ar as category_name,
    u.full_name as submitted_by_name,
    cs.created_at,
    CASE 
        WHEN cs.status IN ('pending', 'ai_review', 'ai_approved') THEN 'content_auditor'
        WHEN cs.status IN ('content_approved', 'content_review') THEN 'technical_auditor'
        ELSE NULL
    END as required_auditor_role
FROM content_submissions cs
LEFT JOIN categories c ON cs.category_id = c.id
LEFT JOIN users u ON cs.submitted_by = u.id
WHERE cs.status IN ('pending', 'ai_review', 'ai_approved', 'content_review', 'content_approved')
ORDER BY cs.created_at ASC;

-- View for content statistics
CREATE VIEW content_statistics AS
SELECT 
    c.name_ar as category,
    COUNT(CASE WHEN pc.type = 'term' THEN 1 END) as terms_count,
    COUNT(CASE WHEN pc.type = 'article' THEN 1 END) as articles_count,
    SUM(pc.views_count) as total_views,
    SUM(pc.likes_count) as total_likes
FROM published_content pc
JOIN categories c ON pc.category_id = c.id
WHERE pc.is_active = TRUE
GROUP BY c.name_ar, c.display_order
ORDER BY c.display_order;

COMMENT ON TABLE users IS 'Stores user accounts and authentication information';
COMMENT ON TABLE categories IS 'Scientific categories for organizing content';
COMMENT ON TABLE content_submissions IS 'Content submitted by contributors awaiting review';
COMMENT ON TABLE published_content IS 'Approved and published content visible to public';
COMMENT ON TABLE workflow_history IS 'Audit trail of all content workflow actions';
COMMENT ON TABLE notifications IS 'User notifications for workflow events';
COMMENT ON TABLE analytics_events IS 'User activity and content interaction tracking';
