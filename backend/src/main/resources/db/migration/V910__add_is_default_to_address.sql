-- Add is_default column for default address feature
ALTER TABLE address ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
