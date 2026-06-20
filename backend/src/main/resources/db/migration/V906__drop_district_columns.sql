-- Remove district columns after API v2 reorganization
-- Wards are now directly under provinces
ALTER TABLE address
    DROP COLUMN IF EXISTS district_code,
    DROP COLUMN IF EXISTS district_name;
