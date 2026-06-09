-- V6: Seed collections data (URL-friendly slug pages)
-- Maps URL slugs to filter configuration

DELETE FROM collections WHERE slug IN (
    'electric-scooters','new-arrivals','sale',
    'kukirin','dualtron','teverun','rovoron','kuickwheel',
    'kukirin-a1','kukirin-g2','kukirin-g2-pro','kukirin-g2-ultra','kukirin-g2-master','kukirin-g4',
    'fighter-mini-q-pro','fighter-eleven-plus','fighter-mini-eco',
    'all-electric-scooters','ultra-powerful','all-terrain','long-range','best-value'
);

-- Special collections (non-product filters)
INSERT INTO collections (slug, title, description, is_all_products, is_new_arrivals, is_sale, display_order) VALUES
    ('electric-scooters', 'Electric Scooters', 'All electric scooters from Vepace.', true, false, false, 1),
    ('new-arrivals', 'New Arrivals', 'Latest electric scooters.', false, true, false, 2),
    ('sale', 'Sale', 'Discounted electric scooters.', false, false, true, 3);

-- Brand collections (by category) - fixed category_id to match V1
INSERT INTO collections (slug, title, description, category_id, display_order) VALUES
    ('kukirin', 'KuKirin Electric Scooters', 'All KuKirin electric scooters.', '00000001-0000-0000-0000-000000000002', 10),
    ('dualtron', 'Dualtron Electric Scooters', 'All Dualtron electric scooters.', '00000001-0000-0000-0000-000000000003', 11),
    ('teverun', 'Teverun Electric Scooters', 'All Teverun electric scooters.', '00000001-0000-0000-0000-000000000004', 12),
    ('rovoron', 'Rovoron Electric Scooters', 'All Rovoron electric scooters.', '00000001-0000-0000-0000-000000000005', 13),
    ('kuickwheel', 'KuickWheel Electric Scooters', 'All KuickWheel electric scooters.', '00000001-0000-0000-0000-000000000006', 14);

-- Product line collections removed: category_type_id values in original V6
-- (e.g. 00000023, 00000024...) do not exist in V1's category_type table.
-- Real category_type IDs from V1: 00000001=Kukirin, 00000002=Dualtron, 00000003=Teverun, 00000004=Rovoron, 00000005=KuickWheel
