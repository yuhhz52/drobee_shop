-- Drop remaining legacy columns
ALTER TABLE address DROP COLUMN IF EXISTS zip_code;
