-- V7: Update seeded branding from Vepace to Horizon without altering historical migrations
-- Safe to run after V1/V4/V6 have already been applied.

UPDATE categories
SET description = 'All electric scooters – HORIZON catalog.',
    updated_at = NOW()
WHERE code = 'electric'
  AND description = 'All electric scooters – VEPACE catalog.';

UPDATE product_resources
SET url = REPLACE(url, 'https://vepace.com/', 'https://horizon.com/'),
    updated_at = NOW()
WHERE url LIKE 'https://vepace.com/%';

UPDATE ath_user
SET last_name = 'Horizon',
    email = 'admin@horizon.com',
    updated_on = NOW()
WHERE id = '00000006-0000-0000-0000-000000000001'
  AND email = 'admin@vepace.com';

UPDATE collections
SET description = 'All electric scooters from Horizon.'
WHERE slug = 'electric-scooters'
  AND description = 'All electric scooters from Vepace.';
