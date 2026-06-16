-- V902: Add banners table (V900 omitted it; Banner JPA entity requires it)
-- This migration is idempotent and safe to run on top of an existing database
-- produced by V900/V901.

-- ════════════════════════════════════════════════════════════════════════
-- BANNERS
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255) NULL,
    alt_text TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(active, display_order);
