-- V8: Fix wrong category_id in brand collections (V6 had IDs shifted)
-- Correct IDs from V1:
--   Kukirin          = 00000001-0000-0000-0000-000000000002
--   Dualtron         = 00000001-0000-0000-0000-000000000003
--   Teverun          = 00000001-0000-0000-0000-000000000004
--   Rovoron          = 00000001-0000-0000-0000-000000000005
--   KuickWheel       = 00000001-0000-0000-0000-000000000006 (may not exist if category was not seeded)

-- Fix collections that reference existing categories
UPDATE collections SET category_id = '00000001-0000-0000-0000-000000000002' WHERE slug = 'kukirin';
UPDATE collections SET category_id = '00000001-0000-0000-0000-000000000003' WHERE slug = 'dualtron';
UPDATE collections SET category_id = '00000001-0000-0000-0000-000000000004' WHERE slug = 'teverun';
UPDATE collections SET category_id = '00000001-0000-0000-0000-000000000005' WHERE slug = 'rovoron';

-- KuickWheel: set to NULL if category 000006 does not exist in DB, otherwise use it
UPDATE collections
SET category_id = '00000001-0000-0000-0000-000000000006'
WHERE slug = 'kuickwheel'
  AND EXISTS (SELECT 1 FROM categories WHERE id = '00000001-0000-0000-0000-000000000006');
