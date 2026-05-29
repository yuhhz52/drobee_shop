-- Seed scooter categories, category types, products, variants, and resources

-- Categories
SET @cat_electric = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_city = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_offroad = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_premium = UNHEX(REPLACE(UUID(), '-', ''));

INSERT INTO categories (id, name, code, description, created_at, updated_at)
VALUES
    (@cat_electric, 'Electric Scooters', 'E_SCOOTERS', 'Modern electric scooters for daily commuting.', NOW(), NOW()),
    (@cat_city, 'City Scooters', 'CITY_SCOOTERS', 'Compact scooters designed for urban mobility.', NOW(), NOW()),
    (@cat_offroad, 'Off-Road Scooters', 'OFFROAD_SCOOTERS', 'High-performance scooters for rough terrain.', NOW(), NOW()),
    (@cat_premium, 'Premium Scooters', 'PREMIUM_SCOOTERS', 'Luxury and long-range premium scooters.', NOW(), NOW());

-- Category types
SET @type_commuter = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_foldable = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_dual_motor = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_long_range = UNHEX(REPLACE(UUID(), '-', ''));

INSERT INTO category_type (id, name, code, description, category_id, created_at, updated_at)
VALUES
    (@type_commuter, 'Commuter Scooters', 'COMMUTER', 'Daily commuting scooters with balanced performance.', @cat_city, NOW(), NOW()),
    (@type_foldable, 'Foldable Scooters', 'FOLDABLE', 'Portable foldable scooters for convenience.', @cat_electric, NOW(), NOW()),
    (@type_dual_motor, 'Dual Motor Scooters', 'DUAL_MOTOR', 'Powerful dual-motor scooters for speed and climbing.', @cat_offroad, NOW(), NOW()),
    (@type_long_range, 'Long Range Scooters', 'LONG_RANGE', 'Scooters optimized for long-distance travel.', @cat_premium, NOW(), NOW());

-- Products
SET @p_xiaomi = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_segway = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_niu = UNHEX(REPLACE(UUID(), '-', ''));

SET @p_kaabo = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_dualtron = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_apollo = UNHEX(REPLACE(UUID(), '-', ''));

SET @p_yadea = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_ola = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_ather = UNHEX(REPLACE(UUID(), '-', ''));

INSERT INTO products (
    id,
    name,
    slug,
    brand,
    short_description,
    description,
    price,
    sale_price,
    rating,
    total_sold,
    featured,
    new_arrival,
    active,
    sku,
    category_type_id,
    created_at,
    updated_at
)
VALUES
    (@p_xiaomi, 'Xiaomi Urban X1', 'xiaomi-urban-x1', 'Xiaomi', 'Foldable urban scooter with smooth acceleration.', 'Compact electric scooter with smooth acceleration and foldable frame.', 899.00, 849.00, 4.5, 245, 1, 1, 1, 'XIAOMI-URBAN-X1', @type_foldable, NOW(), NOW()),

    (@p_segway, 'Segway Ninebot Max G2', 'segway-ninebot-max-g2', 'Segway', 'Long-range commuter with smart display.', 'Long-range commuter scooter with smart display and durable tires.', 1299.00, NULL, 4.8, 520, 1, 1, 1, 'SEGWAY-MAX-G2', @type_commuter, NOW(), NOW()),

    (@p_niu, 'NIU Aero Pro', 'niu-aero-pro', 'NIU', 'Smart scooter with app connectivity.', 'Smart electric scooter with app connectivity and regenerative braking.', 1499.00, 1399.00, 4.7, 310, 0, 0, 1, 'NIU-AERO-PRO', @type_long_range, NOW(), NOW()),

    (@p_kaabo, 'Kaabo Wolf Warrior X', 'kaabo-wolf-warrior-x', 'Kaabo', 'Off-road torque for rough terrain.', 'Off-road dual motor scooter with high torque performance.', 2399.00, NULL, 4.9, 180, 0, 0, 1, 'KAABO-WOLF-X', @type_dual_motor, NOW(), NOW()),

    (@p_dualtron, 'Dualtron Thunder 3', 'dualtron-thunder-3', 'Dualtron', 'Premium high-speed long range.', 'High-speed premium scooter with extreme range capacity.', 3499.00, 3299.00, 5.0, 95, 1, 1, 1, 'DUALTRON-THUNDER-3', @type_long_range, NOW(), NOW()),

    (@p_apollo, 'Apollo Phantom V4', 'apollo-phantom-v4', 'Apollo', 'Advanced suspension for mixed terrain.', 'Advanced suspension scooter for urban and off-road riding.', 2799.00, NULL, 4.8, 155, 0, 0, 1, 'APOLLO-PHANTOM-V4', @type_dual_motor, NOW(), NOW()),

    (@p_yadea, 'Yadea Swift S1', 'yadea-swift-s1', 'Yadea', 'Lightweight city scooter for commuters.', 'Affordable city scooter with lightweight aluminum body.', 999.00, NULL, 4.3, 410, 0, 1, 1, 'YADEA-SWIFT-S1', @type_commuter, NOW(), NOW()),

    (@p_ola, 'Ola Hyper S1', 'ola-hyper-s1', 'Ola', 'High-capacity battery with smart dash.', 'Modern electric scooter with high-capacity battery and smart dashboard.', 1599.00, 1499.00, 4.6, 270, 0, 0, 1, 'OLA-HYPER-S1', @type_long_range, NOW(), NOW()),

    (@p_ather, 'Ather Glide 450', 'ather-glide-450', 'Ather', 'Premium commuter with fast charging.', 'Premium commuter scooter with responsive handling and fast charging.', 1699.00, NULL, 4.8, 200, 1, 1, 1, 'ATHER-GLIDE-450', @type_commuter, NOW(), NOW());

-- Scooter specs
INSERT INTO scooter_specs (
    id,
    product_id,
    motor_power_w,
    peak_power_w,
    max_speed_kmh,
    max_speed_unlocked_kmh,
    range_km,
    max_incline_percent,
    battery_capacity_ah,
    battery_voltage_v,
    battery_type,
    charging_time_hours,
    removable_battery,
    weight_kg,
    max_load_kg,
    frame_material,
    wheel_size_inch,
    tire_type,
    brake_front,
    brake_rear,
    suspension_front,
    suspension_rear,
    length_cm,
    width_cm,
    height_cm,
    folded_length_cm,
    folded_width_cm,
    folded_height_cm,
    lights,
    display_type,
    connectivity,
    water_resistance_rating,
    certifications,
    warranty_months,
    created_at,
    updated_at
)
VALUES
    (UNHEX(REPLACE(UUID(), '-', '')), @p_xiaomi, 350, 700, 25, 30, 35, 12, 10.4, 36.0, 'Li-ion', 5.5, 0, 13.5, 100, 'Aluminum', 8.5, 'Tubeless', 'Drum', 'E-ABS', 'Front spring', 'Rear spring', 108.0, 43.0, 114.0, 108.0, 43.0, 49.0, 'LED', 'LCD', 'Bluetooth', 'IPX5', 'CE', 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_segway, 450, 900, 30, 35, 60, 18, 15.0, 36.0, 'Li-ion', 6.5, 0, 19.0, 120, 'Aluminum', 10.0, 'Tubeless', 'Drum', 'E-ABS', 'Front spring', 'Rear spring', 120.0, 48.0, 120.0, 120.0, 48.0, 52.0, 'LED', 'LCD', 'Bluetooth', 'IPX5', 'CE', 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_niu, 500, 1000, 32, 38, 65, 20, 18.0, 48.0, 'Li-ion', 7.0, 1, 21.0, 120, 'Aluminum', 10.0, 'Tubeless', 'Disc', 'Disc', 'Front spring', 'Rear spring', 121.0, 48.0, 120.0, 121.0, 48.0, 54.0, 'LED', 'LCD', 'Bluetooth', 'IPX6', 'CE', 24, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_kaabo, 1200, 2400, 45, 55, 70, 30, 26.0, 60.0, 'Li-ion', 9.0, 0, 34.0, 150, 'Steel', 11.0, 'Off-road', 'Hydraulic disc', 'Hydraulic disc', 'Front hydraulic', 'Rear hydraulic', 128.0, 62.0, 125.0, 128.0, 62.0, 55.0, 'LED', 'LCD', 'Bluetooth', 'IPX5', 'CE', 18, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_dualtron, 1500, 3000, 60, 70, 85, 35, 32.0, 60.0, 'Li-ion', 10.0, 0, 38.0, 150, 'Alloy', 11.0, 'Performance', 'Hydraulic disc', 'Hydraulic disc', 'Front hydraulic', 'Rear hydraulic', 130.0, 60.0, 125.0, 130.0, 60.0, 57.0, 'LED', 'LCD', 'Bluetooth', 'IPX5', 'CE', 24, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_apollo, 1200, 2400, 50, 60, 65, 28, 23.0, 52.0, 'Li-ion', 8.5, 0, 31.0, 150, 'Alloy', 11.0, 'Street', 'Disc', 'Disc', 'Front spring', 'Rear spring', 125.0, 56.0, 122.0, 125.0, 56.0, 54.0, 'LED', 'LCD', 'Bluetooth', 'IPX5', 'CE', 18, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_yadea, 350, 600, 25, 28, 40, 12, 12.0, 36.0, 'Li-ion', 5.0, 1, 14.0, 100, 'Aluminum', 8.5, 'Tubeless', 'Drum', 'E-ABS', 'Front spring', 'Rear spring', 108.0, 43.0, 110.0, 108.0, 43.0, 50.0, 'LED', 'LCD', 'Bluetooth', 'IPX5', 'CE', 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_ola, 800, 1600, 40, 45, 75, 22, 25.0, 52.0, 'Li-ion', 7.5, 1, 28.0, 120, 'Aluminum', 10.0, 'Tubeless', 'Disc', 'Disc', 'Front spring', 'Rear spring', 120.0, 52.0, 122.0, 120.0, 52.0, 55.0, 'LED', 'LCD', 'Bluetooth', 'IPX6', 'CE', 24, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_ather, 700, 1400, 38, 42, 60, 20, 22.0, 48.0, 'Li-ion', 6.5, 1, 26.0, 120, 'Aluminum', 10.0, 'Tubeless', 'Disc', 'Disc', 'Front spring', 'Rear spring', 118.0, 50.0, 118.0, 118.0, 50.0, 52.0, 'LED', 'LCD', 'Bluetooth', 'IPX5', 'CE', 18, NOW(), NOW());

-- Product variants
INSERT INTO product_variants (
    id,
    color,
    variant_name,
    stock_quantity,
    additional_price,
    product_id,
    created_at,
    updated_at
)
VALUES
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black', 'Standard Range', 120, 0.00, @p_xiaomi, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Gray', 'Long Range', 80, 150.00, @p_segway, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'White', 'Pro Performance', 60, 200.00, @p_niu, NOW(), NOW()),

    (UNHEX(REPLACE(UUID(), '-', '')), 'Yellow', 'Dual Motor', 25, 350.00, @p_kaabo, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black', 'Ultra Range', 18, 450.00, @p_dualtron, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Silver', 'Performance Edition', 22, 300.00, @p_apollo, NOW(), NOW()),

    (UNHEX(REPLACE(UUID(), '-', '')), 'Blue', 'City Lite', 95, 0.00, @p_yadea, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Red', 'Smart Edition', 40, 220.00, @p_ola, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Green', 'Fast Charge', 35, 180.00, @p_ather, NOW(), NOW());

-- Product resources
INSERT INTO product_resources (
    id,
    name,
    url,
    is_primary,
    `type`,
    product_id,
    created_at,
    updated_at
)
VALUES
    (UNHEX(REPLACE(UUID(), '-', '')), 'XiaomiX1', 'uploads/xiaomi-x1.jpg', 1, 'IMAGE', @p_xiaomi, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'SegwayG2', 'uploads/segway-g2.jpg', 1, 'IMAGE', @p_segway, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'NIUAero', 'uploads/niu-aero.jpg', 1, 'IMAGE', @p_niu, NOW(), NOW()),

    (UNHEX(REPLACE(UUID(), '-', '')), 'KaaboWolf', 'uploads/kaabo-wolf.jpg', 1, 'IMAGE', @p_kaabo, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'DualtronThunder', 'uploads/dualtron-thunder.jpg', 1, 'IMAGE', @p_dualtron, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'ApolloPhantom', 'uploads/apollo-phantom.jpg', 1, 'IMAGE', @p_apollo, NOW(), NOW()),

    (UNHEX(REPLACE(UUID(), '-', '')), 'YadeaSwift', 'uploads/yadea-swift.jpg', 1, 'IMAGE', @p_yadea, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'OlaHyper', 'uploads/ola-hyper.jpg', 1, 'IMAGE', @p_ola, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Ather450', 'uploads/ather-450.jpg', 1, 'IMAGE', @p_ather, NOW(), NOW());