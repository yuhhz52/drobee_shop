-- Seed data VEPACE: categories → category_type → products → images → users/roles
-- Idempotent: DELETE before INSERT so migration can re-run safely.

-- ========== CATEGORIES (thương hiệu) ==========
DELETE FROM categories WHERE code IN ('electric','kukirin','dualtron','teverun','rovoron','kuickwheel');
INSERT INTO categories (id, name, code, description, created_at, updated_at)
VALUES
    ('00000001-0000-0000-0000-000000000001', 'Electric Scooters', 'electric', 'All electric scooters – VEPACE catalog.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000002', 'Kukirin', 'kukirin', 'KuKirin electric scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000003', 'Dualtron', 'dualtron', 'Minimotors Dualtron premium scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000004', 'Teverun', 'teverun', 'Teverun performance electric scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000005', 'Rovoron', 'rovoron', 'Rovoron electric scooters.', NOW(), NOW()),
    ('00000001-0000-0000-0000-000000000006', 'KuickWheel', 'kuickwheel', 'KuickWheel compact electric scooters.', NOW(), NOW());

-- ========== CATEGORY TYPES ==========
DELETE FROM category_type WHERE code IN ('electric-kukirin','electric-dualtron','electric-teverun','electric-rovoron','electric-kuickwheel');
INSERT INTO category_type (id, name, code, description, category_id, created_at, updated_at)
VALUES
    ('00000002-0000-0000-0000-000000000001', 'Kukirin Electric Scooters', 'electric-kukirin', 'All Kukirin models.', '00000001-0000-0000-0000-000000000002', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000002', 'Dualtron Electric Scooters', 'electric-dualtron', 'All Dualtron models.', '00000001-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000003', 'Teverun Electric Scooters', 'electric-teverun', 'All Teverun models.', '00000001-0000-0000-0000-000000000004', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000004', 'Rovoron Electric Scooters', 'electric-rovoron', 'All Rovoron models.', '00000001-0000-0000-0000-000000000005', NOW(), NOW()),
    ('00000002-0000-0000-0000-000000000005', 'KuickWheel Electric Scooters', 'electric-kuickwheel', 'All KuickWheel models.', '00000001-0000-0000-0000-000000000006', NOW(), NOW());

-- ========== PRODUCTS ==========
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

-- ========== PRODUCT IMAGES (CDN Vepace) ==========
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
    ('00000004-0000-0000-0000-000000000001', 'Kukirin G2', 'https://vepace.com/cdn/shop/files/kukirin-g2-electric-scooter-2026-main.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000002', 'Kukirin A1', 'https://vepace.com/cdn/shop/files/kukirin-a1-electric-scooter.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000002', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000003', 'Kukirin G2 Pro', 'https://vepace.com/cdn/shop/files/kukirin-g2-pro.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000004', 'Kukirin G2 Master', 'https://vepace.com/cdn/shop/files/kukirin-g2-master.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000004', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000005', 'Kukirin G4', 'https://vepace.com/cdn/shop/files/kukirin-g4.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000005', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000006', 'Kukirin G2 Ultra', 'https://vepace.com/cdn/shop/files/kukirin-g2-ultra.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000006', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000007', 'Dualtron Thunder 3', 'https://vepace.com/cdn/shop/files/dualtron-thunder-3.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000007', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000008', 'Dualtron Togo', 'https://vepace.com/cdn/shop/files/dualtron-togo-limited.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000008', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000009', 'Dualtron Aminia', 'https://vepace.com/cdn/shop/files/dualtron-aminia.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000009', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000010', 'Teverun Mini Q', 'https://vepace.com/cdn/shop/files/teverun-fighter-mini-q.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000010', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000011', 'Teverun Eleven', 'https://vepace.com/cdn/shop/files/teverun-fighter-eleven-plus.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000011', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000012', 'Teverun Eco', 'https://vepace.com/cdn/shop/files/teverun-fighter-mini-eco.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000012', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000013', 'Rovoron S7', 'https://vepace.com/cdn/shop/files/rovoron-s7.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000013', NOW(), NOW()),
    ('00000004-0000-0000-0000-000000000014', 'KuickWheel Urban', 'https://vepace.com/cdn/shop/files/kuickwheel-urban.jpg?v=1&width=800', true, 'IMAGE', '00000003-0000-0000-0000-000000000014', NOW(), NOW());

-- ========== ROLES & ADMIN USER ==========
DELETE FROM ath_user_role WHERE user_id = '00000005-0000-0000-0000-000000000001';
DELETE FROM ath_user WHERE email = 'admin@vepace.com';
DELETE FROM ath_roles WHERE role_code IN ('ROLE_ADMIN','ROLE_USER');

INSERT INTO ath_roles (id, role_code, role_description)
VALUES
    ('00000005-0000-0000-0000-000000000001', 'ROLE_ADMIN', 'Administrator'),
    ('00000005-0000-0000-0000-000000000002', 'ROLE_USER', 'Regular user');

INSERT INTO ath_user (id, first_name, last_name, password, email, created_on, updated_on, provider, phone_number, enabled)
VALUES
    ('00000006-0000-0000-0000-000000000001', 'Admin', 'Vepace', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H4G6p0qF1sM4x5wN8xM5gJqYq3e', 'admin@vepace.com', NOW(), NOW(), 'LOCAL', '0900000000', true);

INSERT INTO ath_user_role (user_id, authority_id)
VALUES
    ('00000006-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001');
