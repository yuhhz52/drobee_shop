-- Seed product variants and scooter specs for all VEPACE products.
-- Idempotent: DELETE before INSERT so migration can re-run safely.

-- ========== PRODUCT VARIANTS ==========
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
    -- Kukirin G2 2026
    ('00000007-0000-0000-0000-000000000001', 'Black', 'Kukirin G2 Black', 30, 0, '00000003-0000-0000-0000-000000000001', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000002', 'Silver', 'Kukirin G2 Silver', 20, 500000, '00000003-0000-0000-0000-000000000001', NOW(), NOW()),
    -- Kukirin A1 2025
    ('00000007-0000-0000-0000-000000000003', 'Black', 'Kukirin A1 Black', 25, 0, '00000003-0000-0000-0000-000000000002', NOW(), NOW()),
    -- Kukirin G2 Pro
    ('00000007-0000-0000-0000-000000000004', 'Black', 'Kukirin G2 Pro Black', 15, 0, '00000003-0000-0000-0000-000000000003', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000005', 'White', 'Kukirin G2 Pro White', 10, 300000, '00000003-0000-0000-0000-000000000003', NOW(), NOW()),
    -- Kukirin G2 Master
    ('00000007-0000-0000-0000-000000000006', 'Black', 'Kukirin G2 Master Black', 12, 0, '00000003-0000-0000-0000-000000000004', NOW(), NOW()),
    -- Kukirin G4 2026
    ('00000007-0000-0000-0000-000000000007', 'Black', 'Kukirin G4 Black', 10, 0, '00000003-0000-0000-0000-000000000005', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000008', 'Orange', 'Kukirin G4 Orange', 8, 1000000, '00000003-0000-0000-0000-000000000005', NOW(), NOW()),
    -- Kukirin G2 Ultra
    ('00000007-0000-0000-0000-000000000009', 'Black', 'Kukirin G2 Ultra Black', 14, 0, '00000003-0000-0000-0000-000000000006', NOW(), NOW()),
    -- Dualtron Thunder 3
    ('00000007-0000-0000-0000-000000000010', 'Black', 'Dualtron Thunder 3 Black', 5, 0, '00000003-0000-0000-0000-000000000007', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000011', 'Red', 'Dualtron Thunder 3 Red', 3, 2000000, '00000003-0000-0000-0000-000000000007', NOW(), NOW()),
    -- Dualtron Togo Limited
    ('00000007-0000-0000-0000-000000000012', 'Black', 'Dualtron Togo Black', 8, 0, '00000003-0000-0000-0000-000000000008', NOW(), NOW()),
    -- Dualtron Aminia Special
    ('00000007-0000-0000-0000-000000000013', 'White', 'Dualtron Aminia White', 6, 0, '00000003-0000-0000-0000-000000000009', NOW(), NOW()),
    -- Teverun Fighter Mini Q Pro
    ('00000007-0000-0000-0000-000000000014', 'Black', 'Teverun Mini Q Pro Black', 10, 0, '00000003-0000-0000-0000-000000000010', NOW(), NOW()),
    -- Teverun Fighter Eleven Plus
    ('00000007-0000-0000-0000-000000000015', 'Black', 'Teverun Eleven Plus Black', 3, 0, '00000003-0000-0000-0000-000000000011', NOW(), NOW()),
    ('00000007-0000-0000-0000-000000000016', 'Silver', 'Teverun Eleven Plus Silver', 2, 1500000, '00000003-0000-0000-0000-000000000011', NOW(), NOW()),
    -- Teverun Fighter Mini Eco
    ('00000007-0000-0000-0000-000000000017', 'Black', 'Teverun Mini Eco Black', 7, 0, '00000003-0000-0000-0000-000000000012', NOW(), NOW()),
    -- Rovoron S7
    ('00000007-0000-0000-0000-000000000018', 'Black', 'Rovoron S7 Black', 4, 0, '00000003-0000-0000-0000-000000000013', NOW(), NOW()),
    -- KuickWheel Urban Pro
    ('00000007-0000-0000-0000-000000000019', 'Black', 'KuickWheel Urban Black', 9, 0, '00000003-0000-0000-0000-000000000014', NOW(), NOW());

-- ========== SCOOTER SPECS ==========
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
    -- Kukirin G2 2026
    ('00000008-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000001',
     500, 900, 25, 45, 55, 15, 13, 48.0, 'Lithium', 7, true, 22.0, 120, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     118, 47, 120, 118, 47, 52,
     'LED Head + Rear', 'LED Display', 'Bluetooth', 'IPX4', 24,
     'CE, RoHS', NOW(), NOW()),

    -- Kukirin A1 2025
    ('00000008-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000002',
     350, 600, 25, 38, 40, 12, 10, 36.0, 'Lithium', 5, true, 16.0, 100, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'E-ABS', 'Spring', NULL,
     108, 42, 110, 108, 42, 45,
     'LED Head', 'LED Display', 'Bluetooth', 'IPX4', 12,
     'CE, RoHS', NOW(), NOW()),

    -- Kukirin G2 Pro
    ('00000008-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000003',
     600, 1000, 25, 50, 65, 18, 15, 48.0, 'Lithium', 8, true, 24.0, 130, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     120, 48, 122, 120, 48, 54,
     'LED Head + Rear + Turn', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),

    -- Kukirin G2 Master
    ('00000008-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000004',
     800, 1300, 25, 55, 75, 20, 20, 52.0, 'Lithium', 10, true, 28.0, 140, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     125, 50, 130, 125, 50, 58,
     'LED Head + Rear + Turn', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS, TUV', NOW(), NOW()),

    -- Kukirin G4 2026
    ('00000008-0000-0000-0000-000000000005', '00000003-0000-0000-0000-000000000005',
     1000, 1600, 25, 60, 90, 22, 25, 60.0, 'Lithium', 12, true, 32.0, 150, 'Aluminium',
     11.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     128, 52, 132, 128, 52, 60,
     'LED Head + Rear + Turn + DRL', 'LCD Color Display', 'Bluetooth', 'IPX6', 24,
     'CE, RoHS, TUV', NOW(), NOW()),

    -- Kukirin G2 Ultra
    ('00000008-0000-0000-0000-000000000006', '00000003-0000-0000-0000-000000000006',
     700, 1100, 25, 52, 70, 18, 18, 52.0, 'Lithium', 9, true, 26.0, 135, 'Aluminium',
     10.0, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     122, 49, 125, 122, 49, 55,
     'LED Head + Rear', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),

    -- Dualtron Thunder 3
    ('00000008-0000-0000-0000-000000000007', '00000003-0000-0000-0000-000000000007',
     3000, 5400, 25, 80, 120, 35, 40, 72.0, 'Lithium', 20, true, 48.0, 180, 'Aluminium',
     11.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     130, 60, 135, 130, 60, 65,
     'LED Head + Rear + Turn + RGB', 'TFT Color Display', 'Bluetooth, App', 'IPX5', 36,
     'CE, UL2272', NOW(), NOW()),

    -- Dualtron Togo Limited
    ('00000008-0000-0000-0000-000000000008', '00000003-0000-0000-0000-000000000008',
     1000, 1700, 25, 55, 60, 20, 18, 52.0, 'Lithium', 10, true, 28.0, 130, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     118, 50, 120, 118, 50, 55,
     'LED Head + Rear', 'LCD Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),

    -- Dualtron Aminia Special
    ('00000008-0000-0000-0000-000000000009', '00000003-0000-0000-0000-000000000009',
     2400, 4200, 25, 70, 100, 30, 35, 60.0, 'Lithium', 18, true, 42.0, 160, 'Aluminium',
     10.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     125, 55, 130, 125, 55, 62,
     'LED Head + Rear + Turn', 'TFT Color Display', 'Bluetooth', 'IPX5', 36,
     'CE, UL2272', NOW(), NOW()),

    -- Teverun Fighter Mini Q Pro
    ('00000008-0000-0000-0000-000000000010', '00000003-0000-0000-0000-000000000010',
     1200, 2000, 25, 58, 65, 22, 20, 52.0, 'Lithium', 10, true, 30.0, 140, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'Disc', 'Spring', 'Spring',
     115, 52, 120, 115, 52, 56,
     'LED Head + Rear + Turn', 'LCD Display', 'Bluetooth, App', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),

    -- Teverun Fighter Eleven Plus
    ('00000008-0000-0000-0000-000000000011', '00000003-0000-0000-0000-000000000011',
     3500, 6000, 25, 85, 130, 40, 45, 72.0, 'Lithium', 22, true, 50.0, 190, 'Aluminium',
     11.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     132, 62, 138, 132, 62, 68,
     'LED Head + Rear + Turn + RGB', 'TFT Color Display', 'Bluetooth, App', 'IPX6', 36,
     'CE, UL2272', NOW(), NOW()),

    -- Teverun Fighter Mini Eco
    ('00000008-0000-0000-0000-000000000012', '00000003-0000-0000-0000-000000000012',
     800, 1400, 25, 50, 55, 18, 16, 48.0, 'Lithium', 8, true, 25.0, 125, 'Aluminium',
     8.5, 'Pneumatic', 'Disc', 'Disc', 'Spring', NULL,
     110, 48, 115, 110, 48, 52,
     'LED Head + Rear', 'LED Display', 'Bluetooth', 'IPX5', 24,
     'CE, RoHS', NOW(), NOW()),

    -- Rovoron S7
    ('00000008-0000-0000-0000-000000000013', '00000003-0000-0000-0000-000000000013',
     2800, 5000, 25, 75, 110, 35, 38, 60.0, 'Lithium', 20, true, 45.0, 170, 'Aluminium',
     10.0, 'Pneumatic', 'Hydraulic Disc', 'Hydraulic Disc', 'Rubber Suspension', 'Rubber Suspension',
     128, 58, 132, 128, 58, 64,
     'LED Head + Rear + Turn + RGB', 'TFT Color Display', 'Bluetooth', 'IPX5', 36,
     'CE, UL2272', NOW(), NOW()),

    -- KuickWheel Urban Pro
    ('00000008-0000-0000-0000-000000000014', '00000003-0000-0000-0000-000000000014',
     500, 800, 25, 40, 35, 10, 10, 36.0, 'Lithium', 4, true, 18.0, 100, 'Aluminium',
     8.0, 'Pneumatic', 'Disc', 'E-ABS', 'Spring', NULL,
     105, 40, 108, 105, 40, 44,
     'LED Head', 'LED Display', 'Bluetooth', 'IPX4', 12,
     'CE, RoHS', NOW(), NOW());
