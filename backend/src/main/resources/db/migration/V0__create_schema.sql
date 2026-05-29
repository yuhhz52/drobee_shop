-- Create core schema before seeding data

CREATE TABLE IF NOT EXISTS categories (
    id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS category_type (
    id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category_id BINARY(16) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_category_type_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
    id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    short_description TEXT NULL,
    description LONGTEXT NULL,
    price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2) NULL,
    rating DECIMAL(2,1) NULL,
    total_sold INT NULL,
    featured TINYINT(1) NULL,
    new_arrival TINYINT(1) NOT NULL,
    active TINYINT(1) NULL,
    sku VARCHAR(255) NULL,
    category_type_id BINARY(16) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_products_slug (slug),
    UNIQUE KEY uk_products_sku (sku),
    CONSTRAINT fk_products_category_type
        FOREIGN KEY (category_type_id) REFERENCES category_type(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_variants (
    id BINARY(16) NOT NULL,
    color VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    stock_quantity INT NOT NULL,
    additional_price DECIMAL(12,2) NULL,
    product_id BINARY(16) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_variant_product
        FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_resources (
    id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    product_id BINARY(16) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_resources_product
        FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS scooter_specs (
    id BINARY(16) NOT NULL,
    product_id BINARY(16) NOT NULL,
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
    removable_battery TINYINT(1) NULL,
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
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_scooter_specs_product (product_id),
    CONSTRAINT fk_scooter_specs_product
        FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ath_roles (
    id BINARY(16) NOT NULL,
    role_code VARCHAR(255) NOT NULL,
    role_description VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ath_user (
    id BINARY(16) NOT NULL,
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    password VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    created_on DATETIME NULL,
    updated_on DATETIME NULL,
    provider VARCHAR(255) NULL,
    verification_code VARCHAR(255) NULL,
    phone_number VARCHAR(255) NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ath_user_role (
    user_id BINARY(16) NOT NULL,
    authority_id BINARY(16) NOT NULL,
    PRIMARY KEY (user_id, authority_id),
    CONSTRAINT fk_ath_user_role_user
        FOREIGN KEY (user_id) REFERENCES ath_user(id),
    CONSTRAINT fk_ath_user_role_authority
        FOREIGN KEY (authority_id) REFERENCES ath_roles(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS address (
    id BINARY(16) NOT NULL,
    name VARCHAR(255) NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    user_id BINARY(16) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id) REFERENCES ath_user(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
    id BINARY(16) NOT NULL,
    order_display_code VARCHAR(255) NOT NULL,
    order_date DATETIME NULL,
    user_id BINARY(16) NOT NULL,
    address_id BINARY(16) NOT NULL,
    total_amount DECIMAL(19,2) NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    shipment_tracking_number VARCHAR(255) NULL,
    expected_delivery_date DATETIME NULL,
    discount DECIMAL(19,2) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_display_code (order_display_code),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES ath_user(id),
    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id) REFERENCES address(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id BINARY(16) NOT NULL,
    product_id BINARY(16) NOT NULL,
    product_variant_id BINARY(16) NULL,
    order_id BINARY(16) NOT NULL,
    quantity INT NOT NULL,
    item_price DECIMAL(19,2) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_order_items_product_variant
        FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment (
    id BINARY(16) NOT NULL,
    order_id BINARY(16) NOT NULL,
    payment_date DATETIME NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_payment_order (order_id),
    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;
