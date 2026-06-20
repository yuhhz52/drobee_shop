-- Add Vietnam administrative division fields to address table
ALTER TABLE address
    ADD COLUMN IF NOT EXISTS province_code VARCHAR(50) NOT NULL,
    ADD COLUMN IF NOT EXISTS province_name VARCHAR(255) NOT NULL,
    ADD COLUMN IF NOT EXISTS district_code VARCHAR(50) NOT NULL,
    ADD COLUMN IF NOT EXISTS district_name VARCHAR(255) NOT NULL,
    ADD COLUMN IF NOT EXISTS ward_code VARCHAR(50) NOT NULL,
    ADD COLUMN IF NOT EXISTS ward_name VARCHAR(255) NOT NULL;

-- Drop old columns (optional - keeping for backward compatibility during transition)
-- ALTER TABLE address DROP COLUMN IF EXISTS city;
-- ALTER TABLE address DROP COLUMN IF EXISTS state;
-- ALTER TABLE address DROP COLUMN IF EXISTS zip_code;
