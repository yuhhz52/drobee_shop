-- Handle legacy city column
-- Option 1: Drop if unused (preferred after Vietnam region migration)
ALTER TABLE address DROP COLUMN IF EXISTS city;
