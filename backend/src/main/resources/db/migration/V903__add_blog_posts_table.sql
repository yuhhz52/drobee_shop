-- V903: Add blog_posts table (V900 omitted it; BlogPost JPA entity requires it)
-- This migration is idempotent and safe to run on top of an existing database
-- produced by V900/V901/V902.

-- ════════════════════════════════════════════════════════════════════════
-- BLOG POSTS
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NULL,
    content TEXT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(255) NULL,
    author_name VARCHAR(255) NULL,
    meta_info VARCHAR(255) NULL,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_active_published ON blog_posts(active, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
