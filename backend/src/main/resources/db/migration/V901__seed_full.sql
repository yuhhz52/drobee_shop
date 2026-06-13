-- V901: Consolidated seed data (replaces V1, V4, V6, V8, V9, V14)
-- All statements are idempotent (DELETE + INSERT by fixed UUIDs / known
-- slugs / known codes) so this file can run safely on a populated database.
--
-- Fixed UUIDs used:
--   categories: 00000001-...-001..006
--   category_type: 00000002-...-001..005
--   products: 00000003-...-001..014
--   product_resources: 00000004-...-001..014
--   roles: 00000005-...-001..002
--   admin user: 00000006-...-001
--   product_variants: 00000007-...-001..019
--   scooter_specs: 00000008-...-001..014

-- ════════════════════════════════════════════════════════════════════════
-- CATEGORIES (V1)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM categories WHERE code IN ('electric','kukirin','dualtron','teverun','rovoron','kuickwheel');
INSERT INTO categories (id, name, code, description, created_at, updated_at)
VALUES
    ('00000001-0000-0000-0000-000000000001', 'Electric Scooters', 'electric', 'All electric scooters – HORIZON catalog.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000002', 'Kukirin', 'kukirin', 'KuKirin electric scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000003', 'Dualtron', 'dualtron', 'Minimotors Dualtron premium scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000004', 'Teverun', 'teverun', 'Teverun performance electric scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000005', 'Rovoron', 'rovoron', 'Rovoron electric scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000006', 'KuickWheel', 'kuickwheel', 'KuickWheel compact electric scooters.', NOW(), NOW());

-- ════════════════════════════════════════════════════════════════════════
-- CATEGORY TYPES (V1)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM category_type WHERE code IN ('electric-kukirin','electric-dualtron','electric-teverun','electric-rovoron','electric-kuickwheel');
INSERT INTO category_type (id, name, code, description, category_id, created_at, updated_at)
VALUES
    ('00000002-0000-0000-0000-000000000001', 'Kukirin Electric Scooters', 'electric-kukirin', 'All Kukirin models.', '00000001-0000-0000-0000-000000000002', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000002', 'Dualtron Electric Scooters', 'electric-dualtron', 'All Dualtron models.', '00000001-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000003', 'Teverun Electric Scooters', 'electric-teverun', 'All Teverun models.', '00000001-0000-0000-0000-000000000004', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000004', 'Rovoron Electric Scooters', 'electric-rovoron', 'All Rovoron models.', '00000001-0000-0000-0000-000000000005', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000005', 'KuickWheel Electric Scooters', 'electric-kuickwheel', 'All KuickWheel models.', '00000001-0000-0000-0000-000000000006', NOW(), NOW());

-- ════════════════════════════════════════════════════════════════════════
-- PRODUCTS (V1)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM products WHERE slug IN (
    'kukirin-g2-2026','kukirin-a1-2025','kukirin-g2-pro','kukirin-g2-master',
    'kukirin-g4-2026','kukirin-g2-ultra',
    'dualtron-thunder-3','dualtron-togo-limited','dualtron-aminia-special',
    'teverun-fighter-mini-q-pro','teverun-fighter-eleven-plus','teverun-fighter-mini-eco',
    'rovoron-s7','kuickwheel-urban-pro'
);
INSERT INTO products (
    id, name, slug, brand, short_description, description,
    price, sale_price, rating, total_sold, featured, new_arrival, active, sku,
    category_type_id, created_at, updated_at
) VALUES
    -- Kukirin
    ('00000003-0000-0000-0000-000000000001', 'KuKirin G2 Electric Scooter 2026', 'kukirin-g2-2026', 'KUKIRIN',
     'Best-value commuter with DGT-ready options.',
     'KuKirin G2 – popular EU commuter scooter. Strong value, foldable frame, app-ready display.',
     14990000, 12990000, 4.8, 520, true, true, true, 'KUKIRIN-G2-2026',
     '00000002-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000002', 'KuKirin A1 Electric Scooter 2025', 'kukirin-a1-2025', 'KUKIRIN',
     'Lightweight entry model for urban riders.',
     'KuKirin A1 – compact and affordable daily commuter.',
     12990000, 9990000, 4.6, 280, false, true, true, 'KUKIRIN-A1-2025',
     '00000002-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000003', 'KuKirin G2 Pro Electric Scooter', 'kukirin-g2-pro', 'KUKIRIN',
     'G2 Pro with seat option and extended range.',
     'KuKirin G2 Pro – upgraded battery and comfort for longer commutes.',
     15990000, 10990000, 4.7, 310, true, false, true, 'KUKIRIN-G2-PRO',
     '00000002-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000004', 'KuKirin G2 Master Electric Scooter', 'kukirin-g2-master', 'KUKIRIN',
     'Premium G2 Master with higher torque.',
     'KuKirin G2 Master – top G2 line for demanding riders.',
     22990000, 20990000, 4.9, 190, true, true, true, 'KUKIRIN-G2-MASTER',
     '00000002-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000005', 'KuKirin G4 Electric Scooter 2026', 'kukirin-g4-2026', 'KUKIRIN',
     'Flagship long-range KuKirin G4.',
     'KuKirin G4 – premium adventure scooter with extended range.',
     26990000, 22990000, 4.8, 140, true, true, true, 'KUKIRIN-G4-2026',
     '00000002-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000006', 'KuKirin G2 Ultra Electric Scooter', 'kukirin-g2-ultra', 'KUKIRIN',
     'G2 Ultra balance of power and portability.',
     'KuKirin G2 Ultra – mid-premium G2 with improved motor.',
     18990000, 16990000, 4.7, 95, false, true, true, 'KUKIRIN-G2-ULTRA',
     '00000002-0000-0000-0000-000000000001', NOW(), NOW()),
    -- Dualtron
    ('00000003-0000-0000-0000-000000000007', 'Dualtron Thunder 3 Electric Scooter', 'dualtron-thunder-3', 'DUALTRON',
     'Legendary Dualtron power and range.',
     'Dualtron Thunder 3 – flagship performance scooter.',
     89990000, 82990000, 5.0, 88, true, true, true, 'DUALTRON-THUNDER-3',
     '00000002-0000-0000-0000-000000000002', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000008', 'Dualtron Togo Limited Electric Scooter', 'dualtron-togo-limited', 'DUALTRON',
     'Compact Dualtron Togo for city riders.',
     'Dualtron Togo Limited – portable premium commuter.',
     22990000, 19990000, 4.7, 120, false, false, true, 'DUALTRON-TOGO-LTD',
     '00000002-0000-0000-0000-000000000002', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000009', 'Dualtron Aminia Special Electric Scooter', 'dualtron-aminia-special', 'DUALTRON',
     'Accessible Dualtron with premium finish.',
     'Dualtron Aminia Special – entry to Dualtron ecosystem.',
     35990000, 19990000, 4.6, 65, false, true, true, 'DUALTRON-AMINIA',
     '00000002-0000-0000-0000-000000000002', NOW(), NOW()),
    -- Teverun
    ('00000003-0000-0000-0000-000000000010', 'TEVERUN Fighter Mini Q Pro', 'teverun-fighter-mini-q-pro', 'TEVERUN',
     'Compact Teverun Fighter for daily use.',
     'TEVERUN Fighter Mini Q Pro – agile urban performance.',
     22990000, 19990000, 4.7, 150, true, false, true, 'TEVERUN-MINI-Q-PRO',
     '00000002-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000011', 'TEVERUN Fighter Eleven Plus', 'teverun-fighter-eleven-plus', 'TEVERUN',
     'High-end Teverun for maximum performance.',
     'TEVERUN Fighter Eleven Plus – extreme power and range.',
     79990000, 72990000, 4.9, 42, true, false, true, 'TEVERUN-ELEVEN-PLUS',
     '00000002-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000003-0000-0000-0000-000000000012', 'TEVERUN Fighter Mini Eco', 'teverun-fighter-mini-eco', 'TEVERUN',
     'Efficient Teverun eco commuter line.',
     'TEVERUN Fighter Mini Eco – balanced efficiency and comfort.',
     32990000, NULL, 4.6, 78, false, true, true, 'TEVERUN-MINI-ECO',
     '00000002-0000-0000-0000-000000000003', NOW(), NOW()),
    -- Rovoron
    ('00000003-0000-0000-0000-000000000013', 'Rovoron S7 Electric Scooter', 'rovoron-s7', 'ROVORON',
     'Premium Rovoron S7 performance.',
     'Rovoron S7 – high-torque premium scooter.',
     64990000, NULL, 4.8, 35, false, true, true, 'ROVORON-S7',
     '00000002-0000-0000-0000-000000000004', NOW(), NOW()),
    -- KuickWheel
    ('00000003-0000-0000-0000-000000000014', 'KuickWheel Urban Pro', 'kuickwheel-urban-pro', 'KUICKWHEEL',
     'Light urban scooter for short commutes.',
     'KuickWheel Urban Pro – compact city mobility.',
     19990000, 16990000, 4.4, 55, false, false, true, 'KUICK-URBAN-PRO',
     '00000002-0000-0000-0000-000000000005', NOW(), NOW());

-- ════════════════════════════════════════════════════════════════════════
-- PRODUCT IMAGES (V1, rebranded to horizon.com in V9)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM product_resources WHERE product_id IN (
    '00000003-0000-0000-0000-000000000001','00000003-0000-0000-0000-000000000002',
    '00000003-0000-0000-0000-000000000003','00000003-0000-0000-0000-000000000004',
    '00000003-0000-0000-0000-000000000005','00000003-0000-0000-0000-000000000006',
    '00000003-0000-0000-0000-000000000007','00000003-0000-0000-0000-000000000008',
    '00000003-0000-0000-0000-000000000009','00000003-0000-0000-0000-000000000010',
    '00000003-0000-0000-0000-000000000011','00000003-0000-0000-0000-000000000012',
    '00000003-0000-0000-0000-000000000013','00000003-0000-0000-0000-000000000014'
);
INSERT INTO product_resources (id, name, url, is_primary, type, product_id, created_at, updated_at)
VALUES
    ('00000004-0000-0000-0000-000000000001', 'Kukirin G2', 'https://horizon.com/cdn/shop/files/kukirin-g2-electric-scooter-2026-main.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000002', 'Kukirin A1', 'https://horizon.com/cdn/shop/files/kukirin-a1-electric-scooter.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000002', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000003', 'Kukirin G2 Pro', 'https://horizon.com/cdn/shop/files/kukirin-g2-pro.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000004', 'Kukirin G2 Master', 'https://horizon.com/cdn/shop/files/kukirin-g2-master.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000004', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000005', 'Kukirin G4', 'https://horizon.com/cdn/shop/files/kukirin-g4.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000005', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000006', 'Kukirin G2 Ultra', 'https://horizon.com/cdn/shop/files/kukirin-g2-ultra.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000006', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000007', 'Dualtron Thunder 3', 'https://horizon.com/cdn/shop/files/dualtron-thunder-3.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000007', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000008', 'Dualtron Togo', 'https://horizon.com/cdn/shop/files/dualtron-togo-limited.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000008', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000009', 'Dualtron Aminia', 'https://horizon.com/cdn/shop/files/dualtron-aminia.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000009', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000010', 'Teverun Mini Q', 'https://horizon.com/cdn/shop/files/teverun-fighter-mini-q.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000010', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000011', 'Teverun Eleven', 'https://horizon.com/cdn/shop/files/teverun-fighter-eleven-plus.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000011', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000012', 'Teverun Eco', 'https://horizon.com/cdn/shop/files/teverun-fighter-mini-eco.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000012', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000013', 'Rovoron S7', 'https://horizon.com/cdn/shop/files/rovoron-s7.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000013', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000014', 'KuickWheel Urban', 'https://horizon.com/cdn/shop/files/kuickwheel-urban.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000014', NOW(), NOW());

-- ════════════════════════════════════════════════════════════════════════
-- ROLES & ADMIN USER (V1, admin email/last_name updated to Horizon in V9)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM ath_user_role WHERE user_id = '00000005-0000-0000-0000-000000000001' OR user_id = '00000006-0000-0000-0000-000000000001';
DELETE FROM ath_user WHERE id = '00000006-0000-0000-0000-000000000001';
DELETE FROM ath_roles WHERE role_code IN ('ROLE_ADMIN','ROLE_USER');

INSERT INTO ath_roles (id, role_code, role_description)
VALUES
    ('00000005-0000-0000-0000-000000000001', 'ROLE_ADMIN', 'Administrator'),
    ('00000005-0000-0000-0000-000000000002', 'ROLE_USER', 'Regular user');

INSERT INTO ath_user (id, first_name, last_name, password, email, created_on, updated_on, provider, phone_number, enabled)
VALUES
    ('00000006-0000-0000-0000-000000000001', 'Admin', 'Horizon', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H4G6p0qF1sM4x5wN8xM5gJqYq3e', 'admin@horizon.com', NOW(), NOW(), 'LOCAL', '0900000000', true);

INSERT INTO ath_user_role (user_id, authority_id)
VALUES
    ('00000006-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001');

-- ════════════════════════════════════════════════════════════════════════
-- PRODUCT VARIANTS (V4)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM product_variants WHERE product_id IN (
    '00000003-0000-0000-0000-000000000001','00000003-0000-0000-0000-000000000002',
    '00000003-0000-0000-0000-000000000003','00000003-0000-0000-0000-000000000004',
    '00000003-0000-0000-0000-000000000005','00000003-0000-0000-0000-000000000006',
    '00000003-0000-0000-0000-000000000007','00000003-0000-0000-0000-000000000008',
    '00000003-0000-0000-0000-000000000009','00000003-0000-0000-0000-000000000010',
    '00000003-0000-0000-0000-000000000011','00000003-0000-0000-0000-000000000012',
    '00000003-0000-0000-0000-000000000013','00000003-0000-0000-0000-000000000014'
);
INSERT INTO product_variants (id, color, variant_name, stock_quantity, additional_price, product_id, created_at, updated_at)
VALUES
    ('00000007-0000-0000-0000-000000000001', 'Black', 'Kukirin G2 Black', 30, 0, '00000003-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000002', 'Silver', 'Kukirin G2 Silver', 20, 500000, '00000003-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000003', 'Black', 'Kukirin A1 Black', 25, 0, '00000003-0000-0000-0000-000000000002', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000004', 'Black', 'Kukirin G2 Pro Black', 15, 0, '00000003-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000005', 'White', 'Kukirin G2 Pro White', 10, 300000, '00000003-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000006', 'Black', 'Kukirin G2 Master Black', 12, 0, '00000003-0000-0000-0000-000000000004', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000007', 'Black', 'Kukirin G4 Black', 10, 0, '00000003-0000-0000-0000-000000000005', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000008', 'Orange', 'Kukirin G4 Orange', 8, 1000000, '00000003-0000-0000-0000-000000000005', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000009', 'Black', 'Kukirin G2 Ultra Black', 14, 0, '00000003-0000-0000-0000-000000000006', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000010', 'Black', 'Dualtron Thunder 3 Black', 5, 0, '00000003-0000-0000-0000-000000000007', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000011', 'Red', 'Dualtron Thunder 3 Red', 3, 2000000, '00000003-0000-0000-0000-000000000007', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000012', 'Black', 'Dualtron Togo Black', 8, 0, '00000003-0000-0000-0000-000000000008', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000013', 'White', 'Dualtron Aminia White', 6, 0, '00000003-0000-0000-0000-000000000009', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000014', 'Black', 'Teverun Mini Q Pro Black', 10, 0, '00000003-0000-0000-0000-000000000010', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000015', 'Black', 'Teverun Eleven Plus Black', 3, 0, '00000003-0000-0000-0000-000000000011', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000016', 'Silver', 'Teverun Eleven Plus Silver', 2, 1500000, '00000003-0000-0000-0000-000000000011', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000017', 'Black', 'Teverun Mini Eco Black', 7, 0, '00000003-0000-0000-0000-000000000012', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000018', 'Black', 'Rovoron S7 Black', 4, 0, '00000003-0000-0000-0000-000000000013', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000019', 'Black', 'KuickWheel Urban Black', 9, 0, '00000003-0000-0000-0000-000000000014', NOW(), NOW());

-- ════════════════════════════════════════════════════════════════════════
-- SCOOTER SPECS (V4)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM scooter_specs WHERE product_id IN (
    '00000003-0000-0000-0000-000000000001','00000003-0000-0000-0000-000000000002',
    '00000003-0000-0000-0000-000000000003','00000003-0000-0000-0000-000000000004',
    '00000003-0000-0000-0000-000000000005','00000003-0000-0000-0000-000000000006',
    '00000003-0000-0000-0000-000000000007','00000003-0000-0000-0000-000000000008',
    '00000003-0000-0000-0000-000000000009','00000003-0000-0000-0000-000000000010',
    '00000003-0000-0000-0000-000000000011','00000003-0000-0000-0000-000000000012',
    '00000003-0000-0000-0000-000000000013','00000003-0000-0000-0000-000000000014'
);
INSERT INTO scooter_specs (
    id, product_id, motor_power_w, peak_power_w, max_speed_kmh, max_speed_unlocked_kmh,
    range_km, max_incline_percent, battery_capacity_ah, battery_voltage_v, battery_type,
    charging_time_hours, removable_battery, weight_kg, max_load_kg, frame_material,
    wheel_size_inch, tire_type, brake_front, brake_rear, suspension_front, suspension_rear,
    length_cm, width_cm, height_cm, folded_length_cm, folded_width_cm, folded_height_cm,
    lights, display_type, connectivity, water_resistance_rating, warranty_months,
    certifications, created_at, updated_at
) VALUES
    ('00000008-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000001',
     500, 900, 25, 45, 55, 15, 13, 48.0, 'Lithium', 7, true, 22.0, 120, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     118, 47, 120, 118, 47, 52,
     'LED Head + Rear', 'LED Display', 'Bluetooth', 'IPX4', 24,
     'CE, RoHS', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000002',
     350, 600, 25, 38, 40, 12, 10, 36.0, 'Lithium', 5, true, 16.0, 100, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'E-ABS', 'Spring', NULL,
     108, 42, 110, 108, 42, 45,
     'LED Head', 'LED Display', 'Bluetooth', 'IPX4', 12,
     'CE, RoHS', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000003',
     600, 1000, 25, 50, 65, 18, 15, 48.0, 'Lithium', 8, true, 24.0, 130, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     120, 48, 122, 120, 48, 54,
     'LED Head + Rear + Turn', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000004',
     800, 1300, 25, 55, 75, 20, 20, 52.0, 'Lithium', 10, true, 28.0, 140, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     125, 50, 130, 125, 50, 58,
     'LED Head + Rear + Turn', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS, TUV', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000005', '00000003-0000-0000-0000-000000000005',
     1000, 1600, 25, 60, 90, 22, 25, 60.0, 'Lithium', 12, true, 32.0, 150, 'Aluminium',
     11.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     128, 52, 132, 128, 52, 60,
     'LED Head + Rear + Turn + DRL', 'LCD Color Display', 'Bluetooth', 'IPX6', 24,
     'CE, RoHS, TUV', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000006', '00000003-0000-0000-0000-000000000006',
     700, 1100, 25, 52, 70, 18, 18, 52.0, 'Lithium', 9, true, 26.0, 135, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     122, 49, 125, 122, 49, 55,
     'LED Head + Rear', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000007', '00000003-0000-0000-0000-000000000007',
     3000, 5400, 25, 80, 120, 35, 40, 72.0, 'Lithium', 20, true, 48.0, 180, 'Aluminium',
     11.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     130, 60, 135, 130, 60, 65,
     'LED Head + Rear + Turn + RGB', 'TFT Color Display', 'Bluetooth, App', 'IPX5', 36,
     'CE, UL2272', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000008', '00000003-0000-0000-0000-000000000008',
     1000, 1700, 25, 55, 60, 20, 18, 52.0, 'Lithium', 10, true, 28.0, 130, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     118, 50, 120, 118, 50, 55,
     'LED Head + Rear', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000009', '00000003-0000-0000-0000-000000000009',
     2400, 4200, 25, 70, 100, 30, 35, 60.0, 'Lithium', 18, true, 42.0, 160, 'Aluminium',
     10.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     125, 55, 130, 125, 55, 62,
     'LED Head + Rear + Turn', 'TFT Color Display', 'Bluetooth', 'IPX5', 36,
     'CE, UL2272', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000010', '00000003-0000-0000-0000-000000000010',
     1200, 2000, 25, 58, 65, 22, 20, 52.0, 'Lithium', 10, true, 30.0, 140, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     115, 52, 120, 115, 52, 56,
     'LED Head + Rear + Turn', 'LCD Display', 'Bluetooth, App', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000011', '00000003-0000-0000-0000-000000000011',
     3500, 6000, 25, 85, 130, 40, 45, 72.0, 'Lithium', 22, true, 50.0, 190, 'Aluminium',
     11.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     132, 62, 138, 132, 62, 68,
     'LED Head + Rear + Turn + RGB', 'TFT Color Display', 'Bluetooth, App', 'IPX6', 36,
     'CE, UL2272', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000012', '00000003-0000-0000-0000-000000000012',
     800, 1400, 25, 50, 55, 18, 16, 48.0, 'Lithium', 8, true, 25.0, 125, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'Disc', 'Spring', NULL,
     110, 48, 115, 110, 48, 52,
     'LED Head + Rear', 'LED Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000013', '00000003-0000-0000-0000-000000000013',
     2800, 5000, 25, 75, 110, 35, 38, 60.0, 'Lithium', 20, true, 45.0, 170, 'Aluminium',
     10.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     128, 58, 132, 128, 58, 64,
     'LED Head + Rear + Turn + RGB', 'TFT Color Display', 'Bluetooth', 'IPX5', 36,
     'CE, UL2272', NOW(), NOW()),
    ('00000008-0000-0000-0000-000000000014', '00000003-0000-0000-0000-000000000014',
     500, 800, 25, 40, 35, 10, 10, 36.0, 'Lithium', 4, true, 18.0, 100, 'Aluminium',
     8.0, 'Pneumatic', 'Disc', 'E-ABS', 'Spring', NULL,
     105, 40, 108, 105, 40, 44,
     'LED Head', 'LED Display', 'Bluetooth', 'IPX4', 12,
     'CE, RoHS', NOW(), NOW());

-- ════════════════════════════════════════════════════════════════════════
-- COLLECTIONS (V6 + V8 fix + V9 rebrand description)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM collections WHERE slug IN (
    'electric-scooters','new-arrivals','sale',
    'kukirin','dualtron','teverun','rovoron','kuickwheel',
    'kukirin-a1','kukirin-g2','kukirin-g2-pro','kukirin-g2-ultra','kukirin-g2-master','kukirin-g4',
    'fighter-mini-q-pro','fighter-eleven-plus','fighter-mini-eco',
    'all-electric-scooters','ultra-powerful','all-terrain','long-range','best-value'
);

INSERT INTO collections (slug, title, description, is_all_products, is_new_arrivals, is_sale, display_order) VALUES
    ('electric-scooters', 'Electric Scooters', 'All electric scooters from Horizon.', true, false, false, 1),
    ('new-arrivals', 'New Arrivals', 'Latest electric scooters.', false, true, false, 2),
    ('sale', 'Sale', 'Discounted electric scooters.', false, false, true, 3);

INSERT INTO collections (slug, title, description, category_id, display_order) VALUES
    ('kukirin', 'KuKirin Electric Scooters', 'All KuKirin electric scooters.', '00000001-0000-0000-0000-000000000002', 10),
    ('dualtron', 'Dualtron Electric Scooters', 'All Dualtron electric scooters.', '00000001-0000-0000-0000-000000000003', 11),
    ('teverun', 'Teverun Electric Scooters', 'All Teverun electric scooters.', '00000001-0000-0000-0000-000000000004', 12),
    ('rovoron', 'Rovoron Electric Scooters', 'All Rovoron electric scooters.', '00000001-0000-0000-0000-000000000005', 13);

INSERT INTO collections (slug, title, description, category_id, display_order)
SELECT 'kuickwheel', 'KuickWheel Electric Scooters', 'All KuickWheel electric scooters.', '00000001-0000-0000-0000-000000000006', 14
WHERE EXISTS (SELECT 1 FROM categories WHERE id = '00000001-0000-0000-0000-000000000006');

-- ════════════════════════════════════════════════════════════════════════
-- COUPONS (V14)
-- ════════════════════════════════════════════════════════════════════════

DELETE FROM coupons WHERE code IN ('WELCOME10','SUMMER20','FLAT500K');
INSERT INTO coupons (code, description, type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_until, active)
VALUES
    ('WELCOME10', '10% off for new customers', 'PERCENTAGE', 10.00, 0, 500000, NOW(), NOW() + INTERVAL '1 year', TRUE),
    ('SUMMER20', '20% off summer sale', 'PERCENTAGE', 20.00, 500000, 1000000, NOW(), NOW() + INTERVAL '3 months', TRUE),
    ('FLAT500K', '500,000 VND off', 'FIXED_AMOUNT', 500000, 1000000, NULL, NOW(), NOW() + INTERVAL '6 months', TRUE);
