-- Seed data đồng bộ website VEPACE (xe điện: Kukirin, Dualtron, Teverun, Rovoron, KuickWheel)
-- Ảnh dùng CDN Vepace để hiển thị ngay trên frontend.

-- ========== CATEGORIES (theo thương hiệu + danh mục tổng) ==========
SET @cat_all       = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_kukirin   = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_dualtron  = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_teverun   = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_rovoron   = UNHEX(REPLACE(UUID(), '-', ''));
SET @cat_kuickwheel = UNHEX(REPLACE(UUID(), '-', ''));

INSERT INTO categories (id, name, code, description, created_at, updated_at)
VALUES
    (@cat_all,        'Electric Scooters', 'electric',     'All electric scooters – VEPACE catalog.', NOW(), NOW()),
    (@cat_kukirin,    'Kukirin',           'kukirin',      'KuKirin electric scooters.', NOW(), NOW()),
    (@cat_dualtron,   'Dualtron',          'dualtron',     'Minimotors Dualtron premium scooters.', NOW(), NOW()),
    (@cat_teverun,    'Teverun',           'teverun',      'Teverun performance electric scooters.', NOW(), NOW()),
    (@cat_rovoron,    'Rovoron',           'rovoron',      'Rovoron electric scooters.', NOW(), NOW()),
    (@cat_kuickwheel, 'KuickWheel',        'kuickwheel',   'KuickWheel compact electric scooters.', NOW(), NOW());

-- ========== CATEGORY TYPES (dòng sản phẩm) ==========
SET @type_g2        = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_g3g4      = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_entry     = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_thunder   = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_togo      = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_fighter   = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_blade     = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_rovoron   = UNHEX(REPLACE(UUID(), '-', ''));
SET @type_kuick     = UNHEX(REPLACE(UUID(), '-', ''));

INSERT INTO category_type (id, name, code, description, category_id, created_at, updated_at)
VALUES
    (@type_g2,      'G2 Series',        'G2_SERIES',    'KuKirin G2 family.', @cat_kukirin, NOW(), NOW()),
    (@type_g3g4,    'G3 / G4 Series',   'G3_G4_SERIES', 'KuKirin adventure & premium.', @cat_kukirin, NOW(), NOW()),
    (@type_entry,   'Entry Models',     'ENTRY',        'Budget-friendly KuKirin.', @cat_kukirin, NOW(), NOW()),
    (@type_thunder, 'Thunder Line',     'THUNDER',      'Dualtron Thunder series.', @cat_dualtron, NOW(), NOW()),
    (@type_togo,    'Togo Line',        'TOGO',         'Dualtron Togo commuter line.', @cat_dualtron, NOW(), NOW()),
    (@type_fighter, 'Fighter Line',     'FIGHTER',      'Teverun Fighter models.', @cat_teverun, NOW(), NOW()),
    (@type_blade,   'Blade Line',       'BLADE',        'Teverun Blade models.', @cat_teverun, NOW(), NOW()),
    (@type_rovoron, 'Rovoron Line',     'ROVORON',      'Rovoron performance line.', @cat_rovoron, NOW(), NOW()),
    (@type_kuick,   'KuickWheel Line',  'KUICK',        'KuickWheel urban line.', @cat_kuickwheel, NOW(), NOW());

-- ========== PRODUCTS ==========
SET @p_g2      = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_a1      = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_g2pro   = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_g2master = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_g4      = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_g2ultra = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_thunder = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_togo    = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_aminia  = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_miniq   = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_eleven  = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_eco     = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_s7      = UNHEX(REPLACE(UUID(), '-', ''));
SET @p_urban   = UNHEX(REPLACE(UUID(), '-', ''));

INSERT INTO products (
    id, name, slug, brand, short_description, description,
    price, sale_price, rating, total_sold, featured, new_arrival, active, sku,
    category_type_id, created_at, updated_at
) VALUES
    (@p_g2, 'KuKirin G2 Electric Scooter 2026', 'kukirin-g2-2026', 'KUKIRIN',
     'Best-value commuter with DGT-ready options.',
     'KuKirin G2 – popular EU commuter scooter. Strong value, foldable frame, app-ready display.',
     589.00, 489.00, 4.8, 520, 1, 1, 1, 'KUKIRIN-G2-2026', @type_g2, NOW(), NOW()),

    (@p_a1, 'KuKirin A1 Electric Scooter 2025', 'kukirin-a1-2025', 'KUKIRIN',
     'Lightweight entry model for urban riders.',
     'KuKirin A1 – compact and affordable daily commuter.',
     519.00, 409.00, 4.6, 280, 0, 1, 1, 'KUKIRIN-A1-2025', @type_entry, NOW(), NOW()),

    (@p_g2pro, 'KuKirin G2 Pro Electric Scooter', 'kukirin-g2-pro', 'KUKIRIN',
     'G2 Pro with seat option and extended range.',
     'KuKirin G2 Pro – upgraded battery and comfort for longer commutes.',
     599.00, 439.00, 4.7, 310, 1, 0, 1, 'KUKIRIN-G2-PRO', @type_g2, NOW(), NOW()),

    (@p_g2master, 'KuKirin G2 Master Electric Scooter', 'kukirin-g2-master', 'KUKIRIN',
     'Premium G2 Master with higher torque.',
     'KuKirin G2 Master – top G2 line for demanding riders.',
     999.00, 849.00, 4.9, 190, 1, 1, 1, 'KUKIRIN-G2-MASTER', @type_g2, NOW(), NOW()),

    (@p_g4, 'KuKirin G4 Electric Scooter 2026', 'kukirin-g4-2026', 'KUKIRIN',
     'Flagship long-range KuKirin G4.',
     'KuKirin G4 – premium adventure scooter with extended range.',
     1069.00, 869.00, 4.8, 140, 1, 1, 1, 'KUKIRIN-G4-2026', @type_g3g4, NOW(), NOW()),

    (@p_g2ultra, 'KuKirin G2 Ultra Electric Scooter', 'kukirin-g2-ultra', 'KUKIRIN',
     'G2 Ultra balance of power and portability.',
     'KuKirin G2 Ultra – mid-premium G2 with improved motor.',
     769.00, 669.00, 4.7, 95, 0, 1, 1, 'KUKIRIN-G2-ULTRA', @type_g2, NOW(), NOW()),

    (@p_thunder, 'Dualtron Thunder 3 Electric Scooter', 'dualtron-thunder-3', 'DUALTRON',
     'Legendary Dualtron power and range.',
     'Dualtron Thunder 3 – flagship performance scooter.',
     3499.00, 3299.00, 5.0, 88, 1, 1, 1, 'DUALTRON-THUNDER-3', @type_thunder, NOW(), NOW()),

    (@p_togo, 'Dualtron Togo Limited Electric Scooter', 'dualtron-togo-limited', 'DUALTRON',
     'Compact Dualtron Togo for city riders.',
     'Dualtron Togo Limited – portable premium commuter.',
     899.00, 799.00, 4.7, 120, 0, 0, 1, 'DUALTRON-TOGO-LTD', @type_togo, NOW(), NOW()),

    (@p_aminia, 'Dualtron Aminia Special Electric Scooter', 'dualtron-aminia-special', 'DUALTRON',
     'Accessible Dualtron with premium finish.',
     'Dualtron Aminia Special – entry to Dualtron ecosystem.',
     1398.00, 799.00, 4.6, 65, 0, 1, 1, 'DUALTRON-AMINIA', @type_togo, NOW(), NOW()),

    (@p_miniq, 'TEVERUN Fighter Mini Q Pro', 'teverun-fighter-mini-q-pro', 'TEVERUN',
     'Compact Teverun Fighter for daily use.',
     'TEVERUN Fighter Mini Q Pro – agile urban performance.',
     899.00, 799.00, 4.7, 150, 1, 0, 1, 'TEVERUN-MINI-Q-PRO', @type_fighter, NOW(), NOW()),

    (@p_eleven, 'TEVERUN Fighter Eleven Plus', 'teverun-fighter-eleven-plus', 'TEVERUN',
     'High-end Teverun for maximum performance.',
     'TEVERUN Fighter Eleven Plus – extreme power and range.',
     2999.00, 2899.00, 4.9, 42, 1, 0, 1, 'TEVERUN-ELEVEN-PLUS', @type_fighter, NOW(), NOW()),

    (@p_eco, 'TEVERUN Fighter Mini Eco', 'teverun-fighter-mini-eco', 'TEVERUN',
     'Efficient Teverun eco commuter line.',
     'TEVERUN Fighter Mini Eco – balanced efficiency and comfort.',
     1299.00, NULL, 4.6, 78, 0, 1, 1, 'TEVERUN-MINI-ECO', @type_fighter, NOW(), NOW()),

    (@p_s7, 'Rovoron S7 Electric Scooter', 'rovoron-s7', 'ROVORON',
     'Premium Rovoron S7 performance.',
     'Rovoron S7 – high-torque premium scooter.',
     2490.00, NULL, 4.8, 35, 0, 1, 1, 'ROVORON-S7', @type_rovoron, NOW(), NOW()),

    (@p_urban, 'KuickWheel Urban Pro', 'kuickwheel-urban-pro', 'KUICKWHEEL',
     'Light urban scooter for short commutes.',
     'KuickWheel Urban Pro – compact city mobility.',
     799.00, 699.00, 4.4, 55, 0, 0, 1, 'KUICK-URBAN-PRO', @type_kuick, NOW(), NOW());

-- ========== SCOOTER SPECS (rút gọn, đủ field chính) ==========
INSERT INTO scooter_specs (
    id, product_id, motor_power_w, peak_power_w, max_speed_kmh, range_km,
    battery_capacity_ah, battery_voltage_v, battery_type, weight_kg, max_load_kg,
    warranty_months, created_at, updated_at
) VALUES
    (UNHEX(REPLACE(UUID(), '-', '')), @p_g2,      800,  1600, 25, 45, 15.6, 48.0, 'Li-ion', 24.5, 120, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_a1,      500,  1000, 25, 35, 10.4, 36.0, 'Li-ion', 18.0, 100, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_g2pro,   1000, 2000, 25, 55, 18.0, 48.0, 'Li-ion', 28.0, 120, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_g2master,1200, 2400, 30, 60, 20.0, 52.0, 'Li-ion', 32.0, 130, 18, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_g4,      2000, 4000, 45, 70, 28.0, 60.0, 'Li-ion', 38.0, 150, 18, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_g2ultra, 1000, 2000, 30, 50, 17.5, 48.0, 'Li-ion', 27.0, 120, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_thunder, 3600, 7200, 100, 120, 40.0, 60.0, 'Li-ion', 46.0, 150, 24, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_togo,    700,  1400, 25, 40, 13.0, 48.0, 'Li-ion', 22.0, 110, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_aminia,  600,  1200, 25, 38, 12.0, 48.0, 'Li-ion', 20.0, 100, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_miniq,   1200, 2400, 25, 50, 18.0, 52.0, 'Li-ion', 26.0, 120, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_eleven,  5000, 10000, 100, 110, 38.0, 60.0, 'Li-ion', 48.0, 150, 24, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_eco,     1000, 2000, 25, 45, 15.0, 48.0, 'Li-ion', 24.0, 115, 12, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_s7,      3000, 6000, 80, 90, 32.0, 60.0, 'Li-ion', 42.0, 140, 18, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), @p_urban,   400,  800,  25, 30, 7.8,  36.0, 'Li-ion', 14.5, 100, 12, NOW(), NOW());

-- ========== VARIANTS (2 mỗi SP: bản chuẩn + S Edition) ==========
INSERT INTO product_variants (id, color, variant_name, stock_quantity, additional_price, product_id, created_at, updated_at)
VALUES
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black',       'Standard',           120,   0.00, @p_g2,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Pearl White', 'G2 S Edition',       85,   99.00, @p_g2,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Gray',        'Standard',            90,   0.00, @p_a1,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Silver',      'A1 S Edition',        45,   79.00, @p_a1,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black',       'G2 Pro Standard',     80,   0.00, @p_g2pro,   NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Red',         'G2 Pro S Edition',    40,  129.00, @p_g2pro,   NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Gunmetal',    'Master Standard',     55,   0.00, @p_g2master,NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Matte Black', 'G2 Master S Edition',30, 149.00, @p_g2master,NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black',       'G4 Standard',         35,   0.00, @p_g4,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Carbon',      'G4 S Edition',        18, 199.00, @p_g4,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Blue',        'Ultra Standard',      28,   0.00, @p_g2ultra, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Sky Blue',    'G2 Ultra S Edition',  15, 109.00, @p_g2ultra, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black',       'Thunder Standard',    22,   0.00, @p_thunder, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Gunmetal',    'Thunder 3 S Edition', 12, 499.00, @p_thunder, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'White',       'Togo Standard',       40,   0.00, @p_togo,    NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Graphite',    'Togo S Edition',      25,  99.00, @p_togo,    NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Silver',      'Aminia Standard',     30,   0.00, @p_aminia,  NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Pearl',       'Aminia S Edition',    15, 149.00, @p_aminia,  NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black',       'Mini Q Standard',     50,   0.00, @p_miniq,   NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Racing Red',  'Mini Q S Edition',    28, 119.00, @p_miniq,   NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black',       'Eleven Standard',     10,   0.00, @p_eleven,  NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Titanium',    'Eleven S Edition',     6, 399.00, @p_eleven,  NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Green',       'Eco Standard',        35,   0.00, @p_eco,     NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Forest',      'Eco S Edition',       20,  89.00, @p_eco,     NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Black',       'S7 Standard',         12,   0.00, @p_s7,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Stealth',     'S7 S Edition',         8, 299.00, @p_s7,      NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'White',       'Urban Standard',      60,   0.00, @p_urban,   NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Mint',        'Urban S Edition',     35,  59.00, @p_urban,   NOW(), NOW());

-- ========== PRODUCT IMAGES (CDN Vepace) ==========
INSERT INTO product_resources (id, name, url, is_primary, `type`, product_id, created_at, updated_at)
VALUES
    (UNHEX(REPLACE(UUID(), '-', '')), 'Kukirin G2', 'https://vepace.com/cdn/shop/files/kukirin-g2-electric-scooter-2026-main.jpg?v=1&width=800', 1, 'IMAGE', @p_g2, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Kukirin A1', 'https://vepace.com/cdn/shop/files/kukirin-a1-electric-scooter.jpg?v=1&width=800', 1, 'IMAGE', @p_a1, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Kukirin G2 Pro', 'https://vepace.com/cdn/shop/files/kukirin-g2-pro.jpg?v=1&width=800', 1, 'IMAGE', @p_g2pro, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Kukirin G2 Master', 'https://vepace.com/cdn/shop/files/kukirin-g2-master.jpg?v=1&width=800', 1, 'IMAGE', @p_g2master, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Kukirin G4', 'https://vepace.com/cdn/shop/files/kukirin-g4.jpg?v=1&width=800', 1, 'IMAGE', @p_g4, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Kukirin G2 Ultra', 'https://vepace.com/cdn/shop/files/kukirin-g2-ultra.jpg?v=1&width=800', 1, 'IMAGE', @p_g2ultra, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Dualtron Thunder 3', 'https://vepace.com/cdn/shop/files/dualtron-thunder-3.jpg?v=1&width=800', 1, 'IMAGE', @p_thunder, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Dualtron Togo', 'https://vepace.com/cdn/shop/files/dualtron-togo-limited.jpg?v=1&width=800', 1, 'IMAGE', @p_togo, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Dualtron Aminia', 'https://vepace.com/cdn/shop/files/dualtron-aminia.jpg?v=1&width=800', 1, 'IMAGE', @p_aminia, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Teverun Mini Q', 'https://vepace.com/cdn/shop/files/teverun-fighter-mini-q.jpg?v=1&width=800', 1, 'IMAGE', @p_miniq, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Teverun Eleven', 'https://vepace.com/cdn/shop/files/teverun-fighter-eleven-plus.jpg?v=1&width=800', 1, 'IMAGE', @p_eleven, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Teverun Eco', 'https://vepace.com/cdn/shop/files/teverun-fighter-mini-eco.jpg?v=1&width=800', 1, 'IMAGE', @p_eco, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'Rovoron S7', 'https://vepace.com/cdn/shop/files/rovoron-s7.jpg?v=1&width=800', 1, 'IMAGE', @p_s7, NOW(), NOW()),
    (UNHEX(REPLACE(UUID(), '-', '')), 'KuickWheel Urban', 'https://vepace.com/cdn/shop/files/kuickwheel-urban.jpg?v=1&width=800', 1, 'IMAGE', @p_urban, NOW(), NOW());
