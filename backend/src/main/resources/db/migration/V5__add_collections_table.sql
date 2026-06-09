-- V5: Add collections table for SEO-friendly slug-based collection pages

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category_id UUID NULL REFERENCES categories(id) ON DELETE SET NULL,
    category_type_id UUID NULL REFERENCES category_type(id) ON DELETE SET NULL,
    is_all_products BOOLEAN NOT NULL DEFAULT false,
    is_new_arrivals BOOLEAN NOT NULL DEFAULT false,
    is_sale BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(active) WHERE deleted_at IS NULL;
