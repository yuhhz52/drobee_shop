-- Create core schema for PostgreSQL

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
