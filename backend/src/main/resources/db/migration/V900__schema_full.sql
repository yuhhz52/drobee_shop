-- V900: Consolidated full schema (replaces V0..V16)
-- This migration creates the complete database schema. It is idempotent
-- (all statements use IF NOT EXISTS) so it can be run on top of an
-- existing database produced by the old V0..V16 files.
--
-- To switch from the old per-version files to this consolidated schema:
--   1. Apply this file (V900) on a fresh database, OR
--   2. On an existing database, set flyway.baseline-on-migrate=true and
--      keep this file at a version higher than the last applied one.
-- See V901__seed_full.sql for the companion seed data file.

-- ════════════════════════════════════════════════════════════════════════
-- CORE TABLES
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS category_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    brand VARCHAR(255) NOT NULL,
    short_description TEXT NULL,
    description TEXT NULL,
    price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2) NULL,
    rating DECIMAL(2,1) NULL,
    total_sold INT NULL,
    featured BOOLEAN NULL,
    new_arrival BOOLEAN NOT NULL,
    active BOOLEAN NULL,
    sku VARCHAR(255) NULL UNIQUE,
    category_type_id UUID NOT NULL REFERENCES category_type(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    color VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    stock_quantity INT NOT NULL,
    additional_price DECIMAL(12,2) NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
-- V13: add active flag to product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS product_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL,
    type VARCHAR(255) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS scooter_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id),
    motor_power_w INT NULL,
    peak_power_w INT NULL,
    max_speed_kmh INT NULL,
    max_speed_unlocked_kmh INT NULL,
    range_km INT NULL,
    max_incline_percent INT NULL,
    battery_capacity_ah DECIMAL(10,2) NULL,
    battery_voltage_v DECIMAL(10,2) NULL,
    battery_type VARCHAR(255) NULL,
    charging_time_hours DECIMAL(10,2) NULL,
    removable_battery BOOLEAN NULL,
    weight_kg DECIMAL(10,2) NULL,
    max_load_kg INT NULL,
    frame_material VARCHAR(255) NULL,
    wheel_size_inch DECIMAL(10,2) NULL,
    tire_type VARCHAR(255) NULL,
    brake_front VARCHAR(255) NULL,
    brake_rear VARCHAR(255) NULL,
    suspension_front VARCHAR(255) NULL,
    suspension_rear VARCHAR(255) NULL,
    length_cm DECIMAL(10,2) NULL,
    width_cm DECIMAL(10,2) NULL,
    height_cm DECIMAL(10,2) NULL,
    folded_length_cm DECIMAL(10,2) NULL,
    folded_width_cm DECIMAL(10,2) NULL,
    folded_height_cm DECIMAL(10,2) NULL,
    lights VARCHAR(255) NULL,
    display_type VARCHAR(255) NULL,
    connectivity VARCHAR(255) NULL,
    water_resistance_rating VARCHAR(255) NULL,
    warranty_months INT NULL,
    certifications VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS ath_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code VARCHAR(255) NOT NULL,
    role_description VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ath_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    password VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    created_on TIMESTAMP NULL,
    updated_on TIMESTAMP NULL,
    provider VARCHAR(255) NULL,
    verification_code VARCHAR(255) NULL,
    phone_number VARCHAR(255) NULL,
    avatar_url VARCHAR(255) NULL,
    enabled BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS ath_user_role (
    user_id UUID NOT NULL REFERENCES ath_user(id),
    authority_id UUID NOT NULL REFERENCES ath_roles(id),
    PRIMARY KEY (user_id, authority_id)
);

CREATE TABLE IF NOT EXISTS address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES ath_user(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_display_code VARCHAR(255) NOT NULL UNIQUE,
    order_date TIMESTAMP NULL,
    user_id UUID NOT NULL REFERENCES ath_user(id),
    address_id UUID NOT NULL REFERENCES address(id),
    total_amount DECIMAL(19,2) NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    shipment_tracking_number VARCHAR(255) NULL,
    expected_delivery_date TIMESTAMP NULL,
    discount DECIMAL(19,2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    product_variant_id UUID NULL REFERENCES product_variants(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    quantity INT NOT NULL,
    item_price DECIMAL(19,2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    payment_date TIMESTAMP NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- ════════════════════════════════════════════════════════════════════════
-- COLLECTIONS (V5)
-- ════════════════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════════════════
-- CART (V10)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES ath_user(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    merged_into_user_id BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_snapshot_name VARCHAR(255),
    product_snapshot_slug VARCHAR(255),
    product_snapshot_image VARCHAR(500),
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    variant_snapshot_name VARCHAR(255),
    variant_snapshot_color VARCHAR(100),
    quantity INT NOT NULL CHECK (quantity > 0 AND quantity <= 99),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT uk_cart_items_cart_product_variant
        UNIQUE (cart_id, product_id, product_variant_id)
);

-- ════════════════════════════════════════════════════════════════════════
-- IDEMPOTENCY KEYS (V11 + V12)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    response JSONB NOT NULL,
    order_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════════════════════════════════════
-- COUPONS (V14 + V15)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(19,2) NOT NULL,
    min_order_amount DECIMAL(19,2) NOT NULL DEFAULT 0,
    max_discount_amount DECIMAL(19,2),
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES ath_user(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- V15: orders.coupon_id
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);

-- ════════════════════════════════════════════════════════════════════════
-- VNPAY TRACKING (V16)
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE payment
    ADD COLUMN IF NOT EXISTS vnpay_txn_ref VARCHAR(100),
    ADD COLUMN IF NOT EXISTS vnpay_transaction_no VARCHAR(100),
    ADD COLUMN IF NOT EXISTS vnpay_response_code VARCHAR(20);

-- ════════════════════════════════════════════════════════════════════════
-- PERFORMANCE INDEXES (V7 + cart + idempotency + coupons + vnpay)
-- ════════════════════════════════════════════════════════════════════════

-- products
CREATE INDEX IF NOT EXISTS idx_products_category_type_id ON products(category_type_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_type_id, active);
CREATE INDEX IF NOT EXISTS idx_products_active_new_arrival ON products(active, new_arrival);

-- product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity);

-- category_type
CREATE INDEX IF NOT EXISTS idx_category_type_category_id ON category_type(category_id);
CREATE INDEX IF NOT EXISTS idx_category_type_code ON category_type(code);

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);

-- collections
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_collections_slug_active ON collections(slug, active);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
-- V15 partial index
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id) WHERE coupon_id IS NOT NULL;

-- product_resources
CREATE INDEX IF NOT EXISTS idx_product_resources_product_id ON product_resources(product_id);

-- carts
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_expires_at ON carts(expires_at) WHERE expires_at IS NOT NULL;

-- cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(product_variant_id) WHERE product_variant_id IS NOT NULL;

-- idempotency
CREATE INDEX IF NOT EXISTS idx_idempotency_key ON idempotency_keys(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);

-- coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

-- vnpay
CREATE INDEX IF NOT EXISTS idx_payment_vnpay_txn_ref ON payment(vnpay_txn_ref);
