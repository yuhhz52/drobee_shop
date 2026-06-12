-- V10: Shopping Cart tables
-- Author: auto-generated
-- Description: Cart + CartItem with FK, unique constraint, and performance indexes

-- ── Carts ──────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carts') THEN
        CREATE TABLE carts (
            id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
            user_id             UUID        REFERENCES ath_user(id) ON DELETE CASCADE,
            session_id          VARCHAR(255),
            merged_into_user_id  BOOLEAN     DEFAULT FALSE,
            expires_at          TIMESTAMP,
            created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
            updated_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
            deleted_at          TIMESTAMP,
            PRIMARY KEY (id)
        );

        -- Indexes for new carts table
        CREATE UNIQUE INDEX idx_carts_user_id ON carts(user_id) WHERE user_id IS NOT NULL;
        CREATE INDEX idx_carts_session_id ON carts(session_id) WHERE session_id IS NOT NULL;
        CREATE INDEX idx_carts_expires_at ON carts(expires_at) WHERE expires_at IS NOT NULL;
    ELSE
        -- Add missing columns to existing carts table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'merged_into_user_id') THEN
            ALTER TABLE carts ADD COLUMN merged_into_user_id BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'expires_at') THEN
            ALTER TABLE carts ADD COLUMN expires_at TIMESTAMP;
        END IF;
    END IF;
END $$;

-- ── Cart Items ─────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        CREATE TABLE cart_items (
            id                      UUID        NOT NULL DEFAULT gen_random_uuid(),
            cart_id                 UUID        NOT NULL REFERENCES carts(id) ON DELETE CASCADE,

            -- Product reference
            product_id              UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
            product_snapshot_name   VARCHAR(255),
            product_snapshot_slug   VARCHAR(255),
            product_snapshot_image  VARCHAR(500),

            -- Variant reference (nullable — product may have no variant)
            product_variant_id      UUID        REFERENCES product_variants(id) ON DELETE RESTRICT,
            variant_snapshot_name    VARCHAR(255),
            variant_snapshot_color  VARCHAR(100),

            -- Quantity & price
            quantity                INT         NOT NULL CHECK (quantity > 0 AND quantity <= 99),
            unit_price              DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),

            -- Audit
            created_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
            updated_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
            deleted_at              TIMESTAMP,

            PRIMARY KEY (id),

            -- Prevent duplicate product+variant in the same cart
            CONSTRAINT uk_cart_items_cart_product_variant
                UNIQUE (cart_id, product_id, product_variant_id)
        );

        -- Indexes for new cart_items table
        CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
        CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
        CREATE INDEX idx_cart_items_variant_id ON cart_items(product_variant_id) WHERE product_variant_id IS NOT NULL;
    END IF;
END $$;

-- ── Migration record ───────────────────────────────────────────────────────────
-- Flyway will auto-insert into flyway_schema_history
