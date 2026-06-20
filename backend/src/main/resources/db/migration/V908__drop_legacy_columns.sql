-- Drop all legacy columns that are no longer needed
ALTER TABLE address DROP COLUMN IF EXISTS city;
ALTER TABLE address DROP COLUMN IF EXISTS state;
ALTER TABLE address DROP COLUMN IF EXISTS country;
